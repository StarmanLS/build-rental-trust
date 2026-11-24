# BUILD RENTAL TRUST — DEVELOPMENT REPORT

**Report information**

- Prompt 007, M1.2A. 24 November 2026, 08:30 MYT. Branch `main`; origin `https://github.com/StarmanLS/build-rental-trust.git`. Pre-cycle commit `de6dd31f98764e7360b931af082af797a97169f5`; final commit is in Git log and the delivery message.
- Stage: Google Maps property location. **PARTIAL** because no owner-approved Maps billing, keys or activation flag exist. The app and current `.local` database were preserved.

## A. Work completed

| Requirement | Actual implementation | Files | Status |
|---|---|---|---|
| MB-09/28 | Added a conditional Google Place Autocomplete (New) address search, interactive map, draggable pin, keyboard coordinate fields and explicit confirmation button inside the listing editor reached immediately after property registration. Existing properties can reopen the editor. | `app/map-location-picker.tsx`, `app/listing-editor.tsx`, `app/globals.css` | Implemented behind configuration; live map untested |
| MB-09/22/31 | Server checks claim access before Place Details access, validates Place ID and coordinates, rejects a pin over 5 km from the selected place, flags >150 m offsets/address differences/duplicate place+unit/conflicting addresses/significant moves, stores prior location, and saves submitted or under-review status. Provider errors do not save a false location. | `server/maps.ts`, `server/domain.ts`, `server/api.ts` | 6 new focused tests; live provider untested |
| MB-09/28 | Publication requires a saved valid place/pin and reviewed ownership or rental authority. Under-review pins and unverified claims remain private; marketplace reads enforce both conditions. | `server/domain.ts`, `tests/listings.test.ts` | Automated tests passed; approval workflow absent |
| MB-31 | Separate browser and server key settings with explicit `GOOGLE_MAPS_APPROVED=1` gate; no key is committed or loaded now. Exact restrictions documented. | `.env.example`, `docs/MAPS-CONFIGURATION.md`, `server/maps.ts` | Configuration ready; not activated |

## B. Tests and verification

- Final regression **77/77 passed**, 0 failed, 0 skipped. Typecheck passed. Isolated production build passed while preview continued running. Existing M1.1 roles/invitations and M1.2 listing tests remained green.
- The first full run had 75/77 passing: one test reused an address with a conflicting place claim and another expected the wrong warning phrase. The assertions were corrected; focused listing tests then passed 13/13 and the final full regression passed 77/77. No product failure was concealed.
- Database: existing migration 006 reused; no migration or data reset. Tests verified persisted coordinates after database reopen, history, address-change invalidation and duplicate warnings.
- Browser: landlord opened the listing editor on the local preview; desktop and 390px mobile both showed the accurate unavailable state with no horizontal overflow. Console errors/warnings: none. Screenshots of that state were captured in the browser session, not exported as files. **Address lookup, drag, confirmation and refresh of a live Google-selected place were not executable or browser-verified** because the keys and approval are absent.
- Security: unauthorized claimants are refused before a potential billable Place Details request; malformed pins and unsupported places fail; publication and marketplace reads enforce authority. No real external Google or AI calls occurred.

## C. Requirement status

Canonical 839 IDs unchanged: TESTED 0; IMPLEMENTED — NOT TESTED 17; PARTIAL 54; NOT STARTED 768; BLOCKED 0; TOTAL 839. Broad tested percentage **0.00%**. No ID or broad status moved this cycle: existing MB-09/28/31 contracts remain partial despite narrow tests. M1.2A is not accepted until a real Google address, moved pin, confirmation, save and refresh are observed.

## D. Defects and blockers

| ID | Severity | Impact / recommended fix | Blocking |
|---|---|---|---|
| RT-011 | High | No approved Google Maps keys/billing. Live map cannot load or confirm a location. Owner-approved configuration and real browser verification needed. | M1.2A acceptance |
| RT-018 | Medium | Enabled-path UI and Google API behavior are untested against real services; key restrictions and quota cannot be verified without configuration. | Live Maps acceptance |
| RT-012 | High | No ownership/rental-authority review interface; therefore no listing can be published even after pin submission. Build M1.2B review. | Publication |
| RT-016/017 | Medium–high | Photos, Street View, walking routes and stronger location/unit-conflict review remain absent. | Full marketplace |

Older recovery and production issues remain in `KNOWN-ISSUES.md` and archived reports.

## E. Research alignment

Used Google's current Place Autocomplete (New), Place Details (New), Maps loading and key-restriction documentation. The server requests only `id,formattedAddress,location`; location is explicitly user-submitted and never an ownership badge. The product differs from the intended live workflow only because the approved services are unavailable. Owner approval is required before billing and key activation. No AI-generated location claim was added.

## F. Architecture and database changes

New `server/maps.ts`, `app/map-location-picker.tsx`, `docs/MAPS-CONFIGURATION.md`; modified `server/api.ts`, `server/domain.ts`, listing editor/CSS, `.env.example`, listing tests. API changes: authenticated `GET /api/v1/maps/config` and claimant-only `POST /api/v1/properties/:id/location`. Database migrations: **none**; migration 006 already had coordinate, Place ID, status and history fields. New dependencies: **none**. Live AI changes: **none**. External calls in this environment: **none**.

## G. Remaining work

Owner-approved Google Maps Platform billing plus restricted browser/server keys; live autocomplete/map/drag/confirmation/refresh verification and actual screenshots; ownership and agent-authority evidence review; secure photographs; publication and tenant visibility; Street View and route-backed transport. M1.3/M1.4 remain future milestones. The owner has not re-confirmed access to this restarted preview in their browser.

## H. Recommended next task

**Complete live M1.2A acceptance, then begin M1.2B property verification.** Dependency: owner-approved Maps billing and restricted keys. First verify actual address search, moved pin, explicit confirmation, persisted coordinates after refresh, failure handling and mobile keyboard use in the browser. Then M1.2B can add property evidence, ownership/authority review, scanned photos and controlled publication. Do not treat the current gated implementation as a completed live integration.

## I. Continuation checkpoint

Root `/Users/lesh/Desktop/Intan/rental-trust-app`; branch `main`; approved origin above. Preview [http://localhost:5199/](http://localhost:5199/) is listening on `127.0.0.1:5199`. Last verified: 77/77 regression, typecheck, isolated build, unavailable-state desktop/mobile browser check and empty console error list. Current `.local` data preserved. Read the five reports, `docs/MAPS-CONFIGURATION.md`, `app/map-location-picker.tsx`, `server/maps.ts`, `server/domain.ts` and `tests/listings.test.ts`. Exact next dependency: approved Maps configuration and live workflow verification; next planned module work: M1.2B.
