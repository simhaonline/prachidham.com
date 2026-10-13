import importlib
import json

import httpx
import pytest
from fastapi.testclient import TestClient
from openai import OpenAI


@pytest.fixture
def app_module(monkeypatch):
    monkeypatch.delenv("INTERNAL_SERVICE_TOKEN", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_BASE", raising=False)
    monkeypatch.delenv("AI_MODEL", raising=False)

    import main

    return importlib.reload(main)


def summarize_payload(**overrides):
    payload = {"title": "Weekly outreach", "text": "Staff completed calls and scheduled follow-ups."}
    payload.update(overrides)
    return payload


def auth_headers(token="internal-test-token"):
    return {"Authorization": f"Bearer {token}"}


def test_summarize_rejects_unauthenticated_request(app_module):
    with TestClient(app_module.app) as client:
        response = client.post("/summarize", json=summarize_payload())

    assert response.status_code == 401


def test_summarize_rejects_when_internal_token_is_unconfigured(app_module):
    with TestClient(app_module.app) as client:
        response = client.post(
            "/summarize", json=summarize_payload(), headers=auth_headers()
        )

    assert response.status_code == 503


def test_summarize_fails_when_provider_key_is_unconfigured(monkeypatch, app_module):
    monkeypatch.setenv("INTERNAL_SERVICE_TOKEN", "internal-test-token")

    with TestClient(app_module.app) as client:
        response = client.post(
            "/summarize", json=summarize_payload(), headers=auth_headers()
        )

    assert response.status_code == 503


def test_summarize_validates_title_and_text(monkeypatch, app_module):
    monkeypatch.setenv("INTERNAL_SERVICE_TOKEN", "internal-test-token")
    monkeypatch.setenv("OPENAI_API_KEY", "provider-test-key")

    with TestClient(app_module.app) as client:
        response = client.post(
            "/summarize",
            json=summarize_payload(title="", text="x" * 4001),
            headers=auth_headers(),
        )

    assert response.status_code == 422


def test_summarize_returns_provider_summary(monkeypatch, app_module):
    monkeypatch.setenv("INTERNAL_SERVICE_TOKEN", "internal-test-token")
    monkeypatch.setenv("OPENAI_API_KEY", "provider-test-key")
    monkeypatch.setenv("AI_MODEL", "provider-model")

    def provider_transport(request: httpx.Request) -> httpx.Response:
        assert request.method == "POST"
        assert request.url.path == "/v1/chat/completions"
        request_payload = json.loads(request.content)
        assert request_payload["model"] == "provider-model"
        assert request_payload["max_tokens"] == 240
        return httpx.Response(
            200,
            json={
                "id": "chatcmpl-test",
                "object": "chat.completion",
                "created": 0,
                "model": "provider-model",
                "choices": [
                    {
                        "index": 0,
                        "message": {"role": "assistant", "content": "Calls completed; follow-ups scheduled."},
                        "finish_reason": "stop",
                    }
                ],
            },
        )

    transport_client = httpx.Client(transport=httpx.MockTransport(provider_transport))
    monkeypatch.setattr(
        app_module,
        "create_openai_client",
        lambda: OpenAI(
            api_key="provider-test-key",
            base_url="https://provider.test/v1",
            http_client=transport_client,
        ),
    )

    with TestClient(app_module.app) as client:
        response = client.post(
            "/summarize", json=summarize_payload(), headers=auth_headers()
        )

    assert response.status_code == 200
    assert response.json() == {"summary": "Calls completed; follow-ups scheduled."}
    transport_client.close()
