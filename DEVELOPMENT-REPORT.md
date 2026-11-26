# BUILD RENTAL TRUST — DEVELOPMENT REPORT

**Report information**

- Prompt 009; 24 November 2026, 23:36 MYT; M1.2B local functional verification and photo management.
- Branch `main`; origin `https://github.com/StarmanLS/build-rental-trust.git`; baseline `425ebcde3fdcc6d429113068ece9216729553195`; delivered commit is `HEAD` after this report is committed (exact identifier in delivery message).
- Overall project: PARTIAL; local synthetic workflow is browser verified, production verification is not.

## A. Work completed

| Requirement | Description and actual result | Files | Status |
|---|---|---|---|
| MB-09-005–010, MB-08-003/004 | Claimant uploads a synthetic TXT authority document, submits, sees Pending review after refresh. Reviewer reads authorized evidence, requests correction, records a document-reviewed decision and reason. Queue updates without reload; claimant sees saved status. No independent ownership/identity claim is made. | `app/property-workspace.tsx`, `app/page.tsx`, `server/property-verification.ts`, migration 008 | Local browser workflow tested; broad requirements partial |
| MB-09/28 | Claimant uploads synthetic JPEG/PNG, sees thumbnails, edits room label, reorders, selects cover, marks outdated and soft-removes. All actions persist; photo action history is stored. | service, UI, CSS, migration 008 | Local browser and service tested; production photos blocked |
| MB-31-005/006/022 | Photo signatures and filename extensions must match; Sharp decodes and re-encodes to WebP without EXIF/GPS; bounded input/output. Source and normalized SHA-256 are stored to reject duplicates. Existing claimant/reviewer/outsider authorization and PDF quarantine remain enforced. | service, migration 008, `package.json`, lockfile | Focused and browser permissions tested; production scanning absent |
| MB-09-010 | Historic current `verified` status is migrated to `document_reviewed`; past decisions remain in append-only history. Publication still requires a valid Google place/pin. | migration 008, service, domain, UI | Tests passed; independent verification not claimed |
| M1.2B browser evidence | Playwright uses installed Chrome and in-memory synthetic file selection; screenshots saved. No browser security setting was weakened. | `scripts/m12b-browser.ts`, `docs/evidence/0009/` | Passed |

Screens reviewed: landlord property verification and photos, reviewer queue and evidence panel, mobile property photos. The UI uses normal business statuses; source search found no rendered demo/development labels in these screens. Existing status warnings were retained. No AI provider, paid service or Maps integration was activated.

## B. Tests and verification

- Focused tests during implementation: domain and property verification 24/24 passed. Final full `npm test`: **80 passed, 0 failed, 0 skipped**, including new photo normalization/action history and reviewed-claim tests. One full regression run occurred after code changes stabilized.
- `npm run typecheck`: passed. Isolated `npm run build`: passed after the isolated build copy received the new Playwright dependency; the first isolated attempt failed only because that dependency was missing there. Source typecheck remained passed.
- Database: additive migration 008 passed in test DBs and existing local `.local` database without reset. Reopen persistence tests passed. The local data is not in Git.
- Installed Chrome via Playwright: synthetic upload → pending → refresh; reviewer evidence/correction/decision → automatic queue update; claimant refresh; photo thumbnail/label/order/cover/outdated/remove → refresh; desktop 1280px and mobile 390px. No page exception or 5xx response in the passing run. Expected 401 during sign-out and 404 for removed image may appear in console; see RT-023.
- Security: claimant self-decision returned 403; unauthenticated evidence download returned 401; service tests deny unrelated photo access and quarantined PDF download. No production penetration test was run.
- Preview: installed Chrome loaded and exercised `http://localhost:5199/` against the persistent local server. Owner-side confirmation for this exact restart was requested and must be recorded separately if received.
- Screenshots: [pending claim](docs/evidence/0009/01-landlord-pending.png), [reviewer correction](docs/evidence/0009/02-reviewer-correction.png), [desktop photos](docs/evidence/0009/03-photos-desktop.png), [mobile photos](docs/evidence/0009/04-photos-mobile.png).

## C. Requirement status

Canonical register unchanged: TESTED **0**; IMPLEMENTED — NOT TESTED **17**; PARTIAL **74**; NOT STARTED **748**; BLOCKED **0**; TOTAL **839**. Broad tested percentage **0.00%**. No identifiers were added, removed or counted twice. This cycle advanced local M1.2B browser acceptance; broad M1.2B remains PARTIAL due production controls and official verification. See `PROJECT-STATUS.md`.

## D. Defects and blockers

| ID | Severity | Impact and fix | Blocking |
|---|---|---|---|
| RT-011/018 | High/medium | Live Maps unavailable without approved credentials; configure and browser verify before publication. | Publication |
| RT-003/021 | High/medium | No production scanner, secure storage or retention; keep real uploads disabled and PDFs quarantined. EXIF stripping is fixed. | Real files |
| RT-020 | High | No independent identity or official ownership check; documents are only marked reviewed. | Official verification |
| RT-023 | Low | Expected 401/404 console resource errors during sign-out/removal in test; inspect if visible to users. | No |

RT-019 and RT-022 were resolved. All historical issues remain in `KNOWN-ISSUES.md` and archived reports.

## E. Research alignment

Kept identity, ownership and rental authority distinct; retained human decisions, reasons and append-only history. The local workflow uses synthetic files and document-review wording because official registry/identity access, privacy review and production scanning are not available. No paid or government API was assumed. Production activation requires security and Malaysian legal/privacy review.

## F. Architecture and database changes

- New module: `scripts/m12b-browser.ts`; no new AI module. Modified: verification service, domain publication guard, property UI, CSS, tests and dependency lockfile.
- Migration 008: review status constraint/conversion, photo source hash, `property_photo_history`. No destructive DB reset.
- Dependencies: runtime `sharp`; dev `playwright`. API route shapes unchanged; photo action adds `label`, reviewer decision adds `document_reviewed`. Security: image normalization, duplicate hashes, private authorization retained. AI: existing source identifiers/category/uploader/time/review metadata remain available for future approved access; no AI action was performed.

## G. Remaining work

Production scanning/storage/retention and privacy review; independent identity/ownership checks; live Google Maps; broad frontend/product modules (payments, maintenance, reviews, passport); production email/MFA and deployment checks. The current owner-browser access confirmation is pending unless separately acknowledged. No paid service was activated.

## H. Recommended next task

**M1.2A live Google Maps location and property registration acceptance.** Covers MB-09 location/property clauses and publication gate. It is the highest visible blocker after local verification/photos. Dependency: owner-approved restricted Maps credentials and billing. Expected: real place/pin confirmation and persisted property location, with publication only after valid location and document-reviewed authority. Required tests: live desktop/mobile browser, provider errors, permission and edit history, focused tests and one final regression.

## I. Continuation checkpoint

Root `/Users/lesh/Desktop/Intan/rental-trust-app`; branch `main`; origin above. Local M1.2B browser path, 80/80 regression, typecheck, isolated build and desktop/mobile Chrome checks are verified. Existing `.local` database preserved; migration 008 applied. Current stage PARTIAL for production. Last narrow completed requirement: private photo action history and document-reviewed reviewer workflow. Outstanding RT-011/018/003/020/021/023. Exact next task: section H. Read these five reports, `server/property-verification.ts`, `app/property-workspace.tsx`, migration 008, browser script and `docs/MAPS-CONFIGURATION.md`. Preview: [http://localhost:5199/](http://localhost:5199/); keep the server running. Prompt 008 history: `docs/reports/0008-m12b/`.
