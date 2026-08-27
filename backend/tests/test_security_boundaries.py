from __future__ import annotations

from pathlib import Path

from app.main import configured_cors_origins


PROJECT_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_SOURCE_ROOT = PROJECT_ROOT / "frontend" / "src"


def frontend_source_text() -> str:
    return "\n".join(
        path.read_text(encoding="utf-8")
        for path in FRONTEND_SOURCE_ROOT.rglob("*")
        if path.is_file() and path.suffix in {".ts", ".tsx"}
    )


def test_frontend_calls_the_backend_ai_route_not_a_provider_directly() -> None:
    source = frontend_source_text()

    assert "/api/ai/chat" in source
    assert "AI_PROVIDER_URL" not in source
    assert "AI_PROVIDER_API_KEY" not in source
    assert "dangerouslySetInnerHTML" not in source
    assert "innerHTML" not in source


def test_local_secret_artifact_is_ignored_without_reading_its_contents() -> None:
    gitignore = (PROJECT_ROOT / ".gitignore").read_text(encoding="utf-8")

    assert "/api key.txt" in gitignore
    assert ".env" in gitignore
    assert "backend/.env.example" not in gitignore


def test_provider_configuration_example_is_backend_only() -> None:
    provider_example = PROJECT_ROOT / "backend" / ".env.example"
    frontend_files = list(FRONTEND_SOURCE_ROOT.rglob("*"))

    assert "AI_PROVIDER_API_KEY=" in provider_example.read_text(encoding="utf-8")
    assert all(
        path.suffix not in {".ts", ".tsx"}
        or "AI_PROVIDER_API_KEY" not in path.read_text(encoding="utf-8")
        for path in frontend_files
    )


def test_deployment_cors_configuration_accepts_exact_origins_only(monkeypatch) -> None:
    monkeypatch.setenv(
        "CORS_ALLOWED_ORIGINS",
        "https://jw-studio.example, https://jw-studio.example/ , *",
    )

    assert configured_cors_origins() == ["https://jw-studio.example"]
