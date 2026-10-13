"""Internal OpenAI-compatible summarization adapter."""

from __future__ import annotations

import hmac
import os
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, status
from openai import OpenAI, OpenAIError
from pydantic import BaseModel, Field

DEFAULT_MODEL = "gpt-4o-mini"
MAX_SUMMARY_TOKENS = 240

app = FastAPI(title="Prachi Dham Intelligence Adapter", docs_url=None, redoc_url=None)


class SummarizeRequest(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    text: str = Field(min_length=1, max_length=4000)


class SummaryResponse(BaseModel):
    summary: str


def unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized",
        headers={"WWW-Authenticate": "Bearer"},
    )


def require_internal_token(
    authorization: Annotated[str | None, Header()] = None,
) -> None:
    """Validate the internal bearer token without revealing configuration state."""
    if authorization is None:
        raise unauthorized()

    scheme, separator, presented_token = authorization.partition(" ")
    if scheme != "Bearer" or not separator or not presented_token:
        raise unauthorized()

    configured_token = os.getenv("INTERNAL_SERVICE_TOKEN")
    if not configured_token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Internal authentication is unavailable",
        )

    if not hmac.compare_digest(
        presented_token.encode("utf-8"), configured_token.encode("utf-8")
    ):
        raise unauthorized()


def create_openai_client() -> OpenAI:
    """Construct an OpenAI-compatible client after the caller checked credentials."""
    api_key = os.environ["OPENAI_API_KEY"]
    base_url = os.getenv("OPENAI_API_BASE") or "https://api.openai.com/v1"
    return OpenAI(api_key=api_key, base_url=base_url)


@app.get("/health")
def health() -> dict[str, str]:
    """Return a public liveness response without configuration details."""
    return {"status": "ok"}


@app.post("/summarize", response_model=SummaryResponse)
def summarize(
    request: SummarizeRequest,
    _: None = Depends(require_internal_token),
) -> SummaryResponse:
    """Summarize bounded, caller-supplied operational text through the configured provider."""
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI provider is unavailable",
        )

    messages = [
        {
            "role": "system",
            "content": (
                "Summarize the supplied internal operational note in concise, neutral prose. "
                "Do not invent facts."
            ),
        },
        {"role": "user", "content": f"Title: {request.title}\n\nText: {request.text}"},
    ]

    try:
        completion = create_openai_client().chat.completions.create(
            model=os.getenv("AI_MODEL", DEFAULT_MODEL),
            messages=messages,
            max_tokens=MAX_SUMMARY_TOKENS,
            temperature=0.2,
        )
        summary = completion.choices[0].message.content
    except (OpenAIError, IndexError, AttributeError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI provider request failed",
        ) from None

    if not summary or not summary.strip():
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI provider returned no summary",
        )

    return SummaryResponse(summary=summary.strip())
