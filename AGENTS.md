# Repository Guidelines

## Project Structure & Module Organization
- `backend/`: Spring Boot (Kotlin/Java 21) API with domain, config, and resource files under `src/main/kotlin` and `src/main/resources`; tests live in `src/test/kotlin`.
- `ai-server/`: FastAPI service entry in `main.py`; Python deps in `requirements.txt`.
- `flutter/goldpet_app/`: Flutter client; main code in `lib/`, assets in `assets/`, platform targets under `android/`, `ios/`, `web/`, etc.
- `docker-compose.yml`: Orchestrates backend, AI, DB, and cache locally; `nginx/` holds gateway configs.
- `scripts/`, `docs/`, `screen/`: Utility scripts, docs, and reference captures; keep new assets organized here when relevant.

## Build, Test, and Development Commands
- Start full stack: `docker-compose up -d` from repo root (shuts down with `docker-compose down`).
- Backend: `cd backend && ./gradlew bootRun` for local API; `./gradlew test` for JUnit suite.
- AI server: `cd ai-server && pip install -r requirements.txt && uvicorn main:app --reload --port 8000` to serve the mock endpoints.
- Flutter app: `cd flutter/goldpet_app && flutter pub get && flutter run` to launch on a device/emulator; `flutter test` for Dart tests.
- Formatting helpers: `flutter format .` for Dart, `./gradlew test` gate for Kotlin (formatter not configured—keep IntelliJ default 4-space indent).

## Coding Style & Naming Conventions
- Kotlin: Prefer idiomatic Spring naming (`*Controller`, `*Service`, `*Repository`). Use 4 spaces, nullable types only when necessary, and constructor injection.
- Dart: Follow Flutter lints (`analysis_options.yaml` includes `flutter_lints`); widget names PascalCase, files snake_case.
- Python: Keep functions snake_case; return Pydantic-friendly structures for FastAPI endpoints. Default to Black-style 88-char lines even if formatter isn’t enforced yet.
- Assets/config: Store environment-specific values in `.env` files (never commit secrets); align Docker compose service names when adding new containers.

## Testing Guidelines
- Backend: JUnit 5; mirror package paths under `src/test/kotlin`. Name tests with `*Tests` and use clear method names (`does...`, `returns...`). Run `./gradlew test` before pushing.
- Flutter: Use `flutter test` for unit/widget tests; group by feature folder. Prefer golden tests for UI diffs when adding screens.
- AI server: Add lightweight FastAPI route tests (e.g., `pytest` with `TestClient`) alongside the module if behavior expands.
- Aim for coverage on new public endpoints and critical flows (auth, payments, data writes); document any gaps in PRs.

## Commit & Pull Request Guidelines
- Commits: Use short, imperative subjects; Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) preferred to match existing history norms.
- PRs: Include summary, screenshots for UI changes, and steps to reproduce/test. Link issues or product tickets and call out migrations or config changes (e.g., new env vars, ports).
- Keep branches focused per feature/fix; rebase over merge when possible to maintain linear history.

## Security & Configuration Tips
- Do not commit secrets; use sample env files (`.env.example`) when adding new settings. Rotate keys referenced in screenshots.
- Verify new network-facing routes are behind auth/role checks where applicable; update `nginx/` configs if paths change.
- When adding storage or queues, document required infra in `docs/` and add compose service stubs for local parity.
