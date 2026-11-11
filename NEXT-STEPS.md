# Next task — approval required

## H. Recommended next task
**Verify the existing database adapter against an isolated standard PostgreSQL server.**
- Objective: run migrations, auth and tenancy/evidence/handover/API tests against disposable server PostgreSQL and correct demonstrated adapter/transaction differences.
- Requirements: MB-25/26/31/32.
- Priority: local PGlite and HTTP tests pass, but the later deployment target remains unvalidated.
- Dependencies: owner approval for the next task and an isolated PostgreSQL test service; do not use the existing .local database or any INTAN/MyilmiAI database. Service installation/credentials may need setup approval if unavailable.
- Expected result: repeatable documented server-database checks and accurate deployment-readiness evidence, without claiming full release completion.
- Required tests: fresh/repeated migrations, reopen persistence, transaction rollback/concurrency, auth sessions, tenancy isolation, document quarantine, handover responses/export and current 59 regressions/build/typecheck.
- Not started. Stop for the next development prompt.

