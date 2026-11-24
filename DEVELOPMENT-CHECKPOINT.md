# BUILD RENTAL TRUST — M1.2A checkpoint

24 November 2026 MYT. Root `/Users/lesh/Desktop/Intan/rental-trust-app`; `main`; approved origin `https://github.com/StarmanLS/build-rental-trust.git`. Final commit is in Git log and delivery message. Existing `.local` database and migrations preserved.

A gated Google Maps/Places (New) picker and server confirmation path now exist. When approved and configured, the listing editor can search places, show a draggable pin, accept keyboard coordinate changes and explicitly submit a location. The server verifies the Place ID with Place Details (New), checks coordinates/address/duplicates/moves, stores prior location and uses submitted/under-review states. Unauthorized actors are denied before provider lookup. Publication requires both location and reviewed authority. The existing roles, invitation acceptance and listing draft workflows remain.

**Live Google Maps is not configured or verified.** No keys, billing approval or `GOOGLE_MAPS_APPROVED=1` were found; no map, Google call, pin drag or live confirmation was observed. The browser correctly showed the unavailable state at desktop and mobile widths, with no horizontal overflow or console errors. Preview listener remained on port 5199. Owner access after this restart was not independently reconfirmed.

Final checks: 77/77 tests, typecheck, isolated build passed. The earlier 75/77 test run reflected two incorrect new test expectations; both were corrected and final regression passed. Canonical 839 IDs unchanged: TESTED 0; IMPLEMENTED — NOT TESTED 17; PARTIAL 54; NOT STARTED 768; BLOCKED 0. M1.2A is PARTIAL. AI remains a contract only.

Next dependency: owner-approved Google Maps Platform billing, restricted browser and server keys, then real browser search/drag/confirm/save/refresh evidence. Next planned product task: M1.2B ownership/authority evidence, secure photos and publication controls. Read the five reports, `docs/MAPS-CONFIGURATION.md`, map picker, maps service and listing tests. Keep the preview running; if it exits, run `npm run dev` without resetting `.local`.
