# Next task — approval required

## H. Recommended next task
**HTTP-level security regression coverage for evidence and handover APIs.**
- Objective: test real request authentication, origins, relationship permissions, downloads, responses, exports and malformed/oversized bodies using isolated synthetic test data.
- Requirements: MB-27/31/32.
- Priority: service tests pass, but endpoint middleware/security boundaries have not been exercised by an automated negative-route suite.
- Dependencies: existing Git baseline and local test runtime; owner approval for next task. No real data or production provider needed.
- Expected result: repeatable route tests and fixes only for demonstrated defects, with preserved UI/database behavior.
- Tests: unauthenticated and unrelated users; incorrect origins; valid participants; cross-version IDs; PDF quarantine; malformed/oversized payloads; download headers; existing 46 regressions/build/typecheck.
- Not started. Stop after Prompt 002 and wait for approval.

