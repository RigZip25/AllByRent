# HANDOFF — for next Cloud Agent (RigZipnew)

## Context
Previous agent built product understanding + premium frontend shell, but ran under **AllByRent** environment and could not push to `RigZip25/RigZipnew`.

This package contains:
- Premium UI source (`src/`, Vite React)
- `docs/PRODUCT.md` — full product brief
- `docs/refs/` — ~50 screenshots of old app flows (domain/flow only, not visual target)
- `AGENTS.md`, `PUSH.md`

## Your job
1. Work in **RigZip25/RigZipnew** (after setup PR #1 merged).
2. Read `docs/PRODUCT.md` and skim `docs/refs/`.
3. Replace `web/` with this premium frontend (adapt paths/package name into workspace `web`).
4. Keep `.cursor/environment.json` working (`npm ci`, server + web terminals).
5. Keep `server/` health; align later to domain (don’t invent random “rigs demo” as product).
6. `npm run typecheck && npm run lint && npm run build` green; demo UI in browser.
7. Commit, push branch, open PR.

## Must preserve from brief
Email OTP only · commercial gate · rent/list · GVWR classes · COI/PTI/insurance model · hour/day/week/month · premium industrial design (not old UAT UI).
