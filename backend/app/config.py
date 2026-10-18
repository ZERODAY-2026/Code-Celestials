"""PS2 Private Legal Document Triage Agent — Backend configuration."""

from __future__ import annotations

import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Local LLM / Ollama
    local_llm_base_url: str = "http://127.0.0.1:11434"
    local_llm_model: str = os.getenv("LOCAL_LLM_MODEL", "gemma3n:4b")

    # Upload limits
    max_upload_mb: int = 25
    allowed_extensions: set[str] = {".pdf", ".txt"}

    # Paths
    temp_sessions_dir: Path = Path("tmp_sessions")

    # Inference
    inference_timeout_seconds: int = 120
    max_context_chars: int = 12000

    # Logging
    log_level: str = "INFO"

    # Privacy
    bind_host: str = "127.0.0.1"
    bind_port: int = 8000

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
