from pydantic import BaseModel, ValidationError, field_validator, model_validator
import hashlib


class VoiceSynthesizerRequest(BaseModel):
    message: str
    style_id: int
    audio_format: str | None = "audio/wav"
    pre_phoneme_length: float = 0.1
    post_phoneme_length: float = 0.1

    @field_validator("audio_format")
    def validate_format(cls, audio_format: str) -> str:
        if audio_format == "audio/aac":
            return "audio/aac"
        elif audio_format == "audio/ogg":
            return "audio/ogg"
        elif audio_format == "audio/ogg;codecs=opus":
            return "audio/ogg;codecs=opus"
        else:
            return "audio/wav"

    def redis_key(self) -> str:
        msg_hash = hashlib.sha256(self.message.encode("UTF-8")).hexdigest()
        return f"{self.audio_format}:{self.style_id}:{msg_hash}"
