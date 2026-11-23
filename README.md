# Rental Trust

Local Malaysian rental workspace for landlords, tenants and property agents. This repository is a partial product foundation; it is not a live service.

## Run locally

From `/Users/lesh/Desktop/Intan/rental-trust-app`, run `npm ci` once, then `npm run dev`. Open [http://localhost:5199/](http://localhost:5199/). Keep the terminal process running. The server listens only on `127.0.0.1:5199`. If a session ends, run `npm run dev` again from this folder; `.local` records and secrets are preserved. Use `npm test`, `npm run typecheck`, and `npm run build` for validation. Build in a separate checkout while the development preview is running, because Next.js uses a shared `.next` directory.

The login screen offers two local sample accounts. Their records are for testing. The app has one account identity per person and separate tenant, landlord and agent workspaces. Access to properties, tenancies, evidence, handovers and viewings is checked by the server.

## Current scope

M1.1 includes role-specific dashboards, existing property and tenancy records, agent viewing history, invitation links, agreement evidence, handover records and activity. Dashboards use available records and show no payment or maintenance outcomes where no record system exists. Property ownership is not verified by registration. Mandatory map selection, verification review, rent evidence, maintenance, reviews and the Rental Trust Passport remain later work.

The AI Rental Trust Engine contract is in [docs/AI-ARCHITECTURE.md](docs/AI-ARCHITECTURE.md). No external AI provider is connected and no AI-generated result is shown.

The local PGlite database and authentication secret live under `.local/` and are excluded from Git. Do not use this synthetic-only server with real personal documents or production data. Read the five root development reports for the latest verified checkpoint and known gaps.
