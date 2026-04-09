from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from hero_client import create_document
from models import MeasurementResult
from services import convert_speech_to_text, extract_measurements


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_dotenv()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/process_audio", response_model=MeasurementResult)
async def process_audio(file: UploadFile = File(...)):
    contents = await file.read()
    transcription = await convert_speech_to_text(contents, file.filename)
    result = await extract_measurements(transcription.text)

    if result is None:
        raise HTTPException(status_code=422, detail="Could not extract measurements from audio")

    actions = [
        {
            "add_product_position_by_id": {
                "product_id": room.material_id,
                "quantity": float(room.area_m2),
            }
        }
        for room in result.rooms
        if room.material_id != "UNBEKANNT"
    ]

    await create_document(
        document_type_id=1227309,
        project_match_id=10049819,
        actions=actions,
    )

    return result
