# Project Cleanup Report

## Summary
The project structure has been significantly cleaned up to focus on the GoldPet Hybrid Architecture.

## 1. Directory Structure (Current)
- `api/`: Spring Boot API Source (Renamed from backend)
- `frontend/`: React Web App Source
- `app/`: Flutter Hybrid App Source (Renamed from mobile)
- `admin/`: Admin Dashboard (Future)
- `admin/`: Admin Dashboard (Future)
- `design/`: HTML/CSS Design Assets
- `infra/`: Server Infrastructure (Docker, Nginx)
- `docs/`: Project Documentation (Current)
    - `archive/`: Old versions and legacy code

## 2. Archived Items
Moved to `docs/archive/`:
- **Legacy Code**: `flutter` (old wrapper), `ai-server` (external now), `temp_code`.
- **Old PRDs**: v1.0 through v2.0 PRDs.
- **Legacy Configs**: Root `nginx/`, `ciccosoft.conf`, root `docker-compose.yml`.

## 3. Documentation Organized
- Moved root markdown summaries (`PROJECT_CURRENT_STATUS.md` etc.) to `docs/`.
- Kept `TODO.md` and `GEMINI.md` in root for quick access.
