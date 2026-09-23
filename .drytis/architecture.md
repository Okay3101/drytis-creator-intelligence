# Drytis Creator Intelligence — Architecture

## Stack
- **Backend**: Laravel 12 (PHP 8.4), MySQL, queued jobs (database queue + worker service), Sanctum token auth (SPA + mobile), Caddy reverse proxy → Node dev server for SPA + PHP API under `/api`.
- **Frontend**: React 18 + Vite + TypeScript SPA at `/workspace/frontend`. Mobile-first responsive. Design system tokens in `src/design/`.
- **Admin**: separate Vite build (`/workspace/frontend-admin`) served at `/admin` route.
- **AI layer**: `app/Services/AI/` — `AiGateway` interface + adapter (OpenAI-compatible; credentials via env). Specialized engines are services consuming the gateway: ContentAnalyzer, DiagnosisEngine, WinningPatternEngine, AudienceEngine, StyleEngine, CompetitorEngine, TrendEngine, ScriptEngine, ReelReadinessEngine.
- **Instagram layer**: `app/Services/Instagram/` — `InstagramClient` (Graph API wrapper), `InstagramOAuthService`, `InstagramInsightsService`. Token encryption at rest. No scraping/passwords/automation bypass.
- **Media pipeline**: uploaded reels stored via `Storage::disk('uploads')`, validated (mp4/mov, size caps), transcoding/probing via ffprobe where available; queued analysis jobs; retention job deletes analyzed media per policy.
- **Async**: all AI analysis, competitor refresh, trend computation, video processing = queued jobs. Client polls job status endpoint; notifications on completion.

## Domain boundaries
- Creator/Brand data isolation enforced via policy classes + `account_type` scoping.
- Central `CreatorIntelligenceService` shared by Diagnose, Create, Trends, Analytics, Marketplace personalization, Automation — no duplicated intelligence logic.
- Config-driven business rules (automation plans, free allowance, thresholds, AI model settings) stored in `platform_settings` (versioned/audited), editable from Admin.

## Ports / routing
- Caddy: `/` → SPA (reverse_proxy node), `/api` and `/admin-api` → PHP backend.
- Background services: `queue-worker`, `scheduler`.

## AI model
Own abstraction: model + version + prompts configurable per engine from Admin (`ai_model_configs` table). Prompt templates versioned. Third-party OpenAI-compatible endpoint used only behind `AiGateway`.
