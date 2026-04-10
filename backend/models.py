from decimal import Decimal

from pydantic import BaseModel, Field, field_validator


# TODO: pull materials/products/Artikel from Hero instead of hard coding them
MATERIALS = [
    {"id": "HA0ZWAOXoAA", "name": "PVC Bodenbelag"},
    {"id": "HA0bFSoDsAA", "name": "Vinyl Bodenbelag"},
    {"id": "HA0Z0--YIAA", "name": "Fliesen"},
    {"id": "UNBEKANNT", "name": "Unbekannt"},
]


class TranscriptionWord(BaseModel):
    text: str
    start: float
    end: float
    type: str
    logprob: float


class TranscriptionResult(BaseModel):
    language_code: str
    language_probability: float
    text: str
    words: list[TranscriptionWord]
    transcription_id: str
    audio_duration_secs: float


class Room(BaseModel):
    name: str = Field(
        description="Name of the room",
        examples=["Wohnzimmer", "Schlafzimmer", "Küche"],
    )
    length_m: Decimal = Field(
        max_digits=5,
        decimal_places=2,
        description="Room length in meters",
        examples=[5.31, 2.56],
    )
    width_m: Decimal = Field(
        max_digits=5,
        decimal_places=2,
        description="Room width in meters",
        examples=[4.15, 3.00],
    )
    material_id: str = Field(
        description="ID of the material from the provided materials list",
        examples=["HA0ZWAOXoAA", "UNBEKANNT"],
    )
    comment: str | None = Field(
        default=None,
        description="Additional notes mentioned for the room",
        examples=["drei Säcke Ausgleichsmasse benötigt"],
    )

    @property
    def area_m2(self) -> Decimal:
        return self.length_m * self.width_m

    @field_validator("length_m", "width_m", mode="before")
    @classmethod
    def normalize_decimal_comma(cls, v: object) -> object:
        if isinstance(v, str):
            return v.replace(",", ".")
        return v

    @field_validator("material_id")
    @classmethod
    def material_must_exist(cls, v: str) -> str:
        valid_ids = {m["id"] for m in MATERIALS}
        if v not in valid_ids:
            raise ValueError(f"material_id {v} not found in MATERIALS (valid: {valid_ids})")
        return v


class MeasurementResult(BaseModel):
    rooms: list[Room]
