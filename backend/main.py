from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path

import pandas as pd
import tensorflow as tf
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

MODEL_PATH = (
    Path(__file__).parent.parent
    / "modelo"
    / "modelo_optimo_epoca_130.h5"
)

app_state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    app_state["model"] = tf.keras.models.load_model(MODEL_PATH)
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

    return {"status": "CSV recibido correctamente", "filas": len(df)}
