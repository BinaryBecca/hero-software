from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

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
    
    return result
