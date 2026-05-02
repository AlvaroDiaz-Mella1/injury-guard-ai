from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.preprocessing.sequence import pad_sequences

MAX_SEMANAS = 14
VALOR_RELLENO_X = -999.0

BACKEND_DIR = Path(__file__).parent

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
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/analyze")
async def analyze(file: UploadFile):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="El archivo debe ser un .csv")

    contents = await file.read()
    df = pd.read_csv(BytesIO(contents))

    df = df.apply(pd.to_numeric, errors="coerce")
    array_crudo = df.values

    modelo = app_state["modelo"]
    imputador = app_state["imputador"]
    escalador = app_state["escalador"]

    array_salvado = imputador.transform(array_crudo)
    array_escalado = escalador.transform(array_salvado)

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
