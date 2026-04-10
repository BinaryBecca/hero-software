from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from models import MeasurementResult
from services import convert_speech_to_text, extract_measurements, create_quote_on_hero


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
    # TODO: move processing to background task, return task ID, create separate endpoints to get results
    transcription = await convert_speech_to_text(contents, file.filename)

    if not transcription.text.strip():
        raise HTTPException(status_code=422, detail="Transcription returned empty text")

    measurements = await extract_measurements(transcription.text)

    if measurements is None:
        raise HTTPException(status_code=422, detail="Could not extract measurements from audio")

    await create_quote_on_hero(measurements)

    return result
