import os
import secrets as secrets_mod
from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from fastapi import Depends, FastAPI, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.preprocessing.sequence import pad_sequences

MAX_SEMANAS = 14
VALOR_RELLENO_X = -999.0

# Upload constraints to prevent resource exhaustion
MAX_UPLOAD_BYTES = 1 * 1024 * 1024  # 1 MB
MAX_ROWS = MAX_SEMANAS
MAX_COLS = 200
ALLOWED_CONTENT_TYPES = {"text/csv", "application/vnd.ms-excel", "application/csv", "text/plain"}

BACKEND_DIR = Path(__file__).parent

# Allowed CORS origins. Override via env var ALLOWED_ORIGINS (comma-separated).
DEFAULT_ORIGINS = [
    "https://tfgalvaro.lovable.app",
    "https://id-preview--66fd6feb-2467-4854-b92c-4fdfc6f8e0d4.lovable.app",
    "http://localhost:5173",
    "http://localhost:3000",
]
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get("ALLOWED_ORIGINS", ",".join(DEFAULT_ORIGINS)).split(",")
    if o.strip()
]

# Optional API key. If set, the endpoint requires the X-API-Key header.
API_KEY = os.environ.get("API_KEY")

app_state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    app_state["modelo"] = tf.keras.models.load_model(BACKEND_DIR / "modelo_optimo_epoca_130.h5")
    app_state["imputador"] = joblib.load(BACKEND_DIR / "imputador_lesiones.pkl")
    app_state["escalador"] = joblib.load(BACKEND_DIR / "scaler_lesiones.pkl")
    yield
    app_state.clear()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
)


def require_api_key(x_api_key: str | None = Header(default=None)):
    if API_KEY:
        if not x_api_key or not secrets_mod.compare_digest(x_api_key, API_KEY):
            raise HTTPException(status_code=401, detail="Unauthorized")
    return True


@app.post("/api/analyze")
async def analyze(file: UploadFile, _: bool = Depends(require_api_key)):
    # Validate filename extension
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="El archivo debe ser un .csv")

    # Validate MIME type
    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail="Tipo de contenido no soportado")

    # Enforce max upload size by reading in bounded chunks
    contents = bytearray()
    chunk_size = 64 * 1024
    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        contents.extend(chunk)
        if len(contents) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="Archivo demasiado grande (máx 1 MB)")

    # Parse with bounded row count
    try:
        df = pd.read_csv(BytesIO(bytes(contents)), nrows=MAX_ROWS + 1)
    except Exception:
        raise HTTPException(status_code=400, detail="CSV inválido o malformado")

    if df.shape[0] == 0:
        raise HTTPException(status_code=400, detail="El CSV está vacío")
    if df.shape[0] > MAX_ROWS:
        raise HTTPException(status_code=400, detail=f"Demasiadas filas (máx {MAX_ROWS})")
    if df.shape[1] > MAX_COLS:
        raise HTTPException(status_code=400, detail=f"Demasiadas columnas (máx {MAX_COLS})")

    df = df.drop(columns=["SEMANA"], errors="ignore")
    df = df.apply(pd.to_numeric, errors="coerce")
    array_crudo = df.values

    modelo = app_state["modelo"]
    imputador = app_state["imputador"]
    escalador = app_state["escalador"]

    try:
        array_salvado = imputador.transform(array_crudo)
        array_escalado = escalador.transform(array_salvado)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="El CSV no tiene la forma esperada por el modelo",
        )

    n_semanas_reales = array_escalado.shape[0]
    X_input = np.expand_dims(array_escalado, axis=0)

    X_pad = pad_sequences(
        X_input,
        maxlen=MAX_SEMANAS,
        padding="post",
        dtype="float32",
        value=VALOR_RELLENO_X,
    )

    y_pred_probs = modelo.predict(X_pad)

    ultimo_indice_real = n_semanas_reales - 1
    probabilidad = float(np.squeeze(y_pred_probs[0, ultimo_indice_real]))

    prob_lesion = round(probabilidad * 100)
    prob_sano = round((1 - probabilidad) * 100)

    if prob_lesion >= prob_sano:
        estado_principal = f"{prob_lesion}% de riesgo de lesión"
    else:
        estado_principal = f"{prob_sano}% de estar sano"

    return {
        "probabilidad_lesion": f"{prob_lesion}%",
        "probabilidad_sano": f"{prob_sano}%",
        "estado_principal": estado_principal,
    }
