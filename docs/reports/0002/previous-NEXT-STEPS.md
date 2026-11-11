# Next steps — approval required

## H. Recommended next task
**Create a version-controlled, reproducible verification baseline.**
- Objective: initialize only the isolated rental app repository, review exclusions, commit the verified source, and add HTTP-level auth/origin/resource-isolation tests for the handover/evidence routes.
- Requirements: MB-25/27/31/32/33/36/37.
- Priority reason: every added module increases recovery and regression risk while no commit or route-boundary test baseline exists.
- Dependencies: owner approval for this next task; local runtime and existing synthetic fixtures. No production service needed.
- Expected result: identified branch/commit, reproducible local checks and recorded endpoint-level permission results; no claim of deployment readiness.
- Required tests: clean-install/build/typecheck; existing 46 tests; unauthenticated/incorrect-origin/unrelated-user upload/list/download/respond/export requests; oversized/malformed requests; successful authenticated route journey; verify private state excluded from Git.

This next task has **not started**. Stop and wait for the next development prompt.


## Later backlog (not authorized as the next task)
Complete handover evidence/media and exit pack; production file pipeline; maintenance; payments and rental passport; real-data and production readiness. Do not begin these merely because they appear here.
