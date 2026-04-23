import asyncio
import logging
import time
import uuid
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from models import ProcessAudioResponse
from services import (
    convert_speech_to_text,
    extract_measurements,
    create_quote_on_hero,
    build_confirmation_text,
    generate_confirmation_audio,
)

logger = logging.getLogger(__name__)

# In-memory store for generated audio clips: {uuid: (bytes, content_type, created_at)}
_audio_store: dict[str, tuple[bytes, str, float]] = {}
_AUDIO_TTL_SECONDS = 300  # 5 minutes


def _cleanup_expired_audio() -> None:
    now = time.time()
    expired = [k for k, (_, _, created) in _audio_store.items() if now - created > _AUDIO_TTL_SECONDS]
    for k in expired:
        del _audio_store[k]


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


@app.get("/audio/{audio_id}")
async def get_audio(audio_id: str):
    entry = _audio_store.get(audio_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Audio not found or expired")
    audio_bytes, content_type, _ = entry
    return Response(content=audio_bytes, media_type=content_type)


@app.post("/process_audio", response_model=ProcessAudioResponse)
async def process_audio(file: UploadFile = File(...), request: Request = None):
    _cleanup_expired_audio()

    contents = await file.read()
    # TODO: move processing to background task, return task ID, create separate endpoints to get results
    transcription = await convert_speech_to_text(contents, file.filename)

    if not transcription.text.strip():
        raise HTTPException(status_code=422, detail="Transcription returned empty text")

    measurements = await extract_measurements(transcription.text)

    if measurements is None:
        raise HTTPException(status_code=422, detail="Could not extract measurements from audio")

    # Generate TTS confirmation audio concurrently with Hero quote creation
    confirmation_text = build_confirmation_text(measurements)
    hero_task = create_quote_on_hero(measurements)
    tts_task = generate_confirmation_audio(confirmation_text)
    hero_result, tts_result = await asyncio.gather(hero_task, tts_task, return_exceptions=True)

    # Re-raise Hero errors (quote creation is critical)
    if isinstance(hero_result, BaseException):
        raise hero_result

    # TTS failure is non-fatal
    confirmation_audio_url = None
    if isinstance(tts_result, BaseException):
        logger.warning("TTS generation failed, returning result without audio", exc_info=tts_result)
    else:
        audio_id = str(uuid.uuid4())
        _audio_store[audio_id] = (tts_result, "audio/mpeg", time.time())
        confirmation_audio_url = str(request.url_for("get_audio", audio_id=audio_id))

    return ProcessAudioResponse(
        rooms=measurements.rooms,
        confirmation_audio_url=confirmation_audio_url,
    )
