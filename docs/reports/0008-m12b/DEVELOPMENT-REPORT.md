# BUILD RENTAL TRUST — DEVELOPMENT REPORT

**Report information**

- Prompt 008; 24 November 2026, 14:41 MYT; M1.2B property verification and photographs.
- Branch `main`; origin `https://github.com/StarmanLS/build-rental-trust.git`; pre-cycle commit `d21dedd6efde2e3fa98f3a9d77cb7cbf4a37ea80`. Final commit is the next commit in Git log and the delivery message.
- Overall status: **PARTIAL**, local synthetic application. Existing `.local` data and migrations preserved.

## A. Work completed

| Requirement | Description / actual implementation | Files changed | Status |
|---|---|---|---|
| MB-08/09 | Five property relationships now save separately from the legacy claim role. Identity, ownership, authority, and overall review have separate states. Existing properties display their original claim role. | `server/domain.ts`, `server/property-verification.ts`, `app/page.tsx`, `app/property-workspace.tsx`, migration 007 | Partial: identity cannot be verified in this cycle |
| MB-09-008/012–018 | Claimants can attach private TXT/PDF evidence by category. Bytes, SHA-256, original filename, category, uploader and time persist. Invalid sizes/types rejected; PDFs quarantined. Evidence download requires claimant/reviewer authorization. | property verification service, API, migration 007, UI | Local synthetic workflow tested at service level; production scanning/storage absent |
| MB-08-003/004 | Reviewer grant is seeded for a separate local reviewer account; reviewer queue and decision form support reasons, correction requests, approval/rejection/expiry/suspension and append-only decision history. Self-review denied. Verified ownership and authority are separate; uploading never verifies. | `server/main.ts`, service, API, UI | Partial: full browser review path not completed |
| MB-09/28 | Claimant-only photo upload, private thumbnails, room labels, cover choice, reordering, outdated flag and soft removal. Image signatures/size checked; no public image reuse. | service, API, migration 007, UI/CSS | Service tested; browser upload untested |
| MB-09/28 | Dashboard shows draft, pending location, pending authority, eligible, published, paused, withdrawn or rejected from current records. Existing publication still requires Google location and reviewed claim. | `server/domain.ts`, `app/page.tsx` | Focused tests passed; live publication unavailable |
| MB-31 | Existing API session, origin, rate and synthetic-account restrictions applied to new routes. Reviewer and resource permissions enforced by server. | `server/api.ts`, service | Service permission tests passed |

No live AI function, Google Maps call, paid service or new dependency was added. Future AI can use document/photo category, SHA-256, uploader, timestamps, property linkage and reviewer decision references; no extraction or generated result is claimed.

## B. Tests and verification

- **Final full regression:** 79 passed, 0 failed, 0 skipped (`npm test` with local HTTP bind permission). First restricted run failed 13 HTTP tests with `listen EPERM`; one existing test expected six migrations. Migration assertion updated to seven; approved rerun passed. Three focused service tests passed. They cover submission/approval separation, self/unrelated access, agent correction history after database reopen, private photo bytes, outdated flag and soft removal. The third test was added after the 79-test full run and passed separately.
- **After final dashboard query edit:** focused domain/listing/property-review tests 36/36 passed. Typecheck passed. Isolated production build passed; preview build assets were not disturbed.
- **Database:** migration 007 applied successfully in test databases and in the existing local preview without reset. Reopen persistence test passed. Local `.local` database remains excluded from Git.
- **Browser:** Chrome on the user's computer loaded the landlord dashboard and verification modal at desktop and 390px mobile widths. Saved the legacy property-manager relationship; a no-evidence submission correctly returned a validation error. Reviewer account signed in and showed its gated Reviews tab and empty queue. Screenshots were captured in the browser session but could not be exported as repository files. Chrome extension file chooser refused `setFiles` because its “Allow access to file URLs” setting is off; evidence/photo upload, pending claim, reviewer decision and photo organization were therefore **not browser verified**. This is an automation limitation, not a claimed product pass. No console audit was run this cycle.
- **Preview:** `127.0.0.1:5199` listener remains running and an approved local HTTP check returned 200 after final restart. Chrome had loaded successfully before that last restart; user-side access after it has not been reconfirmed.
- **Security:** unrelated user and claimant self-approval rejected in service tests. PDF download rejected while quarantined. Identity approval is blocked until a separate identity workflow exists. Production security acceptance not achieved.

## C. Requirement status

Canonical 839 IDs retained: TESTED **0**; IMPLEMENTED — NOT TESTED **17**; PARTIAL **74**; NOT STARTED **748**; BLOCKED **0**; TOTAL **839**. Broad tested percentage **0.00%**. Twenty IDs moved NOT STARTED → PARTIAL, listed in `PROJECT-STATUS.md`; no ID removed. Current M1.2B stage is **PARTIAL**, not accepted. These are exact register counts, not an estimate of feature completeness.

## D. Defects and blockers

| ID | Severity | Description / impact | Fix | Blocking |
|---|---|---|---|---|
| RT-011 | High | No approved Google Maps keys/billing; no live location confirmation or publication. | Configure restricted keys after owner approval and run live browser flow. | Publication/M1.2A acceptance |
| RT-003 | High | Local text/PDF and image storage lacks production scanning, encryption-at-rest/key management and retention controls. PDFs quarantined. | Build approved secure storage/scanning pipeline. | Real documents/photos |
| RT-019 | Medium | Chrome automation extension cannot attach local files with its current file-URL setting. End-to-end upload/review/photo proof is incomplete. | Use a permitted browser upload test or enable the extension setting with owner approval; retest. | M1.2B browser acceptance |
| RT-020 | High | No independent identity verification; identity status intentionally stays not started. | Add approved identity evidence/provider and reviewer safeguards. | Identity acceptance |
| RT-021 | Medium | Image metadata/EXIF stripping, content scanning and original photo evidence version policy are incomplete. | Implement before production photo use. | Production photos |
| RT-022 | Medium | Reviewer queue does not refresh automatically after a decision; a page reload shows saved state. | Refresh queue after decision. | UX only |

Other prior issues remain in `KNOWN-ISSUES.md` and archived reports.

## E. Research alignment

Kept identity, ownership and rental authority separate, and kept human decisions with reasons/audit history. The local workflow differs from production research because it accepts only synthetic test files and quarantines PDF evidence; no external registry or government API was assumed. Real identity, document privacy and legal evidence standards need Malaysian adviser review before activation. No paid integration decision was made.

## F. Architecture and database changes

New modules: `server/property-verification.ts`, `app/property-workspace.tsx`. Modified modules: domain, API, main, page, CSS, tests. Migration: `007-property-verification-photos.sql` adds verification, evidence, decisions, reviewer grants and photo tables. Dependencies: none. API: authenticated property verification/evidence/photo routes and reviewer queue; dashboard includes reviewer grant. Security: server-side claim/reviewer access checks, local synthetic file gate, bounded uploads and quarantined PDFs. AI: metadata/source references only; no provider call.

## G. Remaining work

Complete browser upload → pending → reviewer correction/decision → refreshed status → photo organization on real UI; production scanning/storage, EXIF stripping, identity verification, live Maps, publication, photo evidence version policy, legal/privacy review. Other Module 1 milestones (payments, maintenance, reviews, passport) remain future work. No Google credentials were present this cycle.

## H. Recommended next task

**Finish M1.2B browser acceptance and safe file pipeline.** Cover MB-08/09/31. Priority: the server workflow exists but cannot be accepted until upload, reviewer decisions and photo actions are observed end-to-end, and real documents need a secure processing path. Dependencies: a browser upload path that permits local synthetic files; production storage/scanner decisions for real files. Expected result: one synthetic claim and photo flow saved and refreshed in Chrome, with claimant/reviewer/outsider checks. Tests: upload validation, auth, decision history, photo changes, desktop/mobile browser and full regression if code changes warrant it.

## I. Continuation checkpoint

Project root `/Users/lesh/Desktop/Intan/rental-trust-app`; `main`; origin above. Last verified: 79/79 full regression, 36/36 focused after final query change, typecheck, isolated build, desktop/mobile Chrome property UI, local HTTP 200 on port 5199. Current stage M1.2B PARTIAL. Last completed narrow work: claimant/reviewer service and private photo management. Outstanding: browser file upload/full review, production security, live Maps. Exact next task is section H. Continue with this report, `PROJECT-STATUS.md`, `KNOWN-ISSUES.md`, `NEXT-STEPS.md`, `server/property-verification.ts`, `app/property-workspace.tsx`, migration 007 and tests. Preview: [http://localhost:5199/](http://localhost:5199/); keep server running. Prior report archived at `docs/reports/0007-m12a/`.
