import logging
import os

import httpx
from openai import AsyncOpenAI

from hero_client import create_document
from models import MATERIALS, MATERIAL_NAME_BY_ID, TranscriptionResult, MeasurementResult

logger = logging.getLogger(__name__)


async def convert_speech_to_text(file_bytes: bytes, filename: str) -> TranscriptionResult:
    stt_url = "https://api.elevenlabs.io/v1/speech-to-text"

    headers = {
        "xi-api-key": os.environ["ELEVENLABS_API_KEY"],
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            stt_url,
            headers=headers,
            files={"file": (filename, file_bytes)},
            data={"model_id": "scribe_v1"},
        )
        response.raise_for_status()

    result = TranscriptionResult.model_validate(response.json())
    logger.info("Transcribed text: %s", result.text)
    return result


async def extract_measurements(transcript: str) -> MeasurementResult | None:
    client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])

    response = await client.responses.parse(
        model="gpt-5.4",
        instructions=(
            "Extract room measurements from the German transcript. "
            "For each room, extract the name, length and width in meters, "
            "and match the flooring material to the provided materials list by ID. "
            "Include any additional comments mentioned for the room (e.g. extra materials needed)."
        ),
        input=f"Materials:\n{MATERIALS}\n\nTranscript:\n{transcript}",
        text_format=MeasurementResult,
    )

    result = response.output_parsed
    logger.info("LLM extracted data: %s", result)
    return result


def build_confirmation_text(result: MeasurementResult) -> str:
    n = len(result.rooms)
    if n == 1:
        intro = "Es wurde 1 Raum erfasst: "
    else:
        intro = f"Es wurden {n} Räume erfasst: "

    parts = []
    total_area = 0
    for room in result.rooms:
        material_name = MATERIAL_NAME_BY_ID.get(room.material_id, "Unbekannt")
        area = room.area_m2
        total_area += area
        part = f"{room.name}, {room.length_m} mal {room.width_m} Meter, {material_name}, {area} Quadratmeter"
        if room.comment:
            part += f", Hinweis: {room.comment}"
        parts.append(part)

    return intro + ". ".join(parts) + f". Gesamtfläche: {total_area} Quadratmeter."


async def generate_confirmation_audio(text: str) -> bytes:
    voice_id = os.environ.get("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
    tts_url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    headers = {
        "xi-api-key": os.environ["ELEVENLABS_API_KEY"],
        "Content-Type": "application/json",
    }

    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(tts_url, headers=headers, json=payload, timeout=30.0)
        response.raise_for_status()

    return response.content


async def create_quote_on_hero(result: MeasurementResult) -> dict:
    actions = [
        {
            "add_product_position_by_id": {
                "product_id": room.material_id,
                "quantity": float(room.area_m2),
            }
        }
        for room in result.rooms
        if room.material_id != "UNBEKANNT" # when creating quote on Hero ignore unknown material
    ]

    return await create_document(
        document_type_id=1227309, # hard coding document type - Angebot
        project_match_id=10049819, # hard coding project, in future handle projects properly
        actions=actions,
    )
