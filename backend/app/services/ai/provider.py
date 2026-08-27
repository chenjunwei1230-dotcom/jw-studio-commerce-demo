from __future__ import annotations

import json
import os
from collections.abc import Mapping
from typing import Any, Protocol
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


class AIProviderError(RuntimeError):
    """Base error for provider boundary failures safe to handle internally."""


class ProviderNotConfiguredError(AIProviderError):
    """Raised when the server-side provider configuration is incomplete."""


class ProviderUnavailableError(AIProviderError):
    """Raised when a configured provider cannot be reached."""


class ProviderResponseError(AIProviderError):
    """Raised when a provider response does not match the expected shape."""


class AIProvider(Protocol):
    async def generate(self, *, system_prompt: str, user_prompt: str) -> str:
        """Generate an answer from the protected server-side provider boundary."""


class OpenAICompatibleProvider:
    """Minimal provider adapter using an OpenAI-compatible chat endpoint.

    The adapter deliberately uses the Python standard library so the provider remains
    replaceable while the selected provider and model are still an open decision.
    """

    def __init__(
        self,
        *,
        url: str,
        api_key: str,
        model: str,
        timeout_seconds: float = 8.0,
    ) -> None:
        parsed_url = urlparse(url)
        if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
            raise ProviderNotConfiguredError("provider URL is not configured")
        if not api_key.strip() or not model.strip():
            raise ProviderNotConfiguredError("provider credentials are not configured")

        self._url = url
        self._api_key = api_key
        self._model = model
        self._timeout_seconds = max(0.5, min(timeout_seconds, 10.0))

    @classmethod
    def from_environment(cls) -> OpenAICompatibleProvider:
        url = os.getenv("AI_PROVIDER_URL", "")
        api_key = os.getenv("AI_PROVIDER_API_KEY", "")
        model = os.getenv("AI_PROVIDER_MODEL", "")
        timeout_value = os.getenv("AI_PROVIDER_TIMEOUT_SECONDS", "8")

        try:
            timeout_seconds = float(timeout_value)
        except ValueError as error:
            raise ProviderNotConfiguredError("provider timeout is not configured") from error

        return cls(
            url=url,
            api_key=api_key,
            model=model,
            timeout_seconds=timeout_seconds,
        )

    async def generate(self, *, system_prompt: str, user_prompt: str) -> str:
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }
        request = Request(
            self._url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urlopen(request, timeout=self._timeout_seconds) as response:
                response_body = response.read(1_000_000)
        except (HTTPError, URLError, TimeoutError, OSError) as error:
            raise ProviderUnavailableError("the AI provider is unavailable") from error

        try:
            payload = json.loads(response_body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise ProviderResponseError("the AI provider returned invalid data") from error

        answer = self._extract_answer(payload)
        if answer is None:
            raise ProviderResponseError("the AI provider returned an invalid answer")
        return answer

    @staticmethod
    def _extract_answer(payload: Any) -> str | None:
        if not isinstance(payload, Mapping):
            return None
        choices = payload.get("choices")
        if not isinstance(choices, list) or not choices:
            return None
        first_choice = choices[0]
        if not isinstance(first_choice, Mapping):
            return None
        message = first_choice.get("message")
        if not isinstance(message, Mapping):
            return None
        content = message.get("content")
        return content if isinstance(content, str) else None
