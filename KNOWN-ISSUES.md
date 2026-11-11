# Known issues — checkpoint 0001

## D. Defects and blockers
| ID | Severity | Description / affected feature / current impact | Recommended fix | Blocking status |
|---|---|---|---|---|
| RT-001 | High | No Git repository or commit; code history cannot be reproduced from a commit. | Establish isolated repository, ignore private state and commit verified baseline. | Blocks versioned release, not local preview. |
| RT-002 | High | Standard PostgreSQL and hosted CI unexecuted; local tests use PGlite. | Run migration/concurrency/auth/API checks against dedicated PostgreSQL. | Blocks deployment assurance. |
| RT-003 | High | No production file scanning/encrypted object storage; PDFs remain quarantined; handover photos absent. | Implement private storage, scan/release and attachment pipeline. | Blocks real document/photo workflow. |
| RT-004 | High | Production auth/email/MFA/recovery unvalidated; Better Auth logs shared per-path rate-limit fallback when client IP is unavailable. | Configure trusted IP handling, production auth/email and security tests. | Blocks production access. |
| RT-005 | High | Real-data legal/privacy scope and counsel unresolved; demand validation incomplete. | Complete owner-led validation and appointed adviser review. | Blocks real-data pilot; synthetic work allowed. |
| RT-006 | Medium | Handover comparison matches type and label; renamed items remain unmatched. No photo attachment, signature, deposit or utility settlement. | Stable inventory identities and evidence links; separately scoped settlement work. | Full D3 incomplete. |
| RT-007 | Medium | No HTTP negative-route suite, full accessibility/security/load/restore verification. | Add boundary tests and staged release checks. | Blocks full acceptance/release. |
| RT-008 | Low | Existing preview tabs can retain connection-error state during server restarts. Fresh tab restores preview. | Improve graceful restart and preview reconnection. | Non-blocking locally. |

Earlier planning risks K-01–K-12 remain preserved in the research `KNOWN-ISSUES.md`; the app issue file maps them rather than erasing them.


## Historical risk mapping
K-01 demand validation → RT-005 (synthetic build authorized); K-02 absent application scaffold is resolved, but missing Git history is RT-001; K-03 → RT-005; K-04 → RT-003/004; K-05 identity rubric remains unvalidated; K-06 government API remains unconfirmed; K-07 signing/financial provider and custody scope remain unapproved; K-08 reference fairness/moderation unresolved; K-09 no measured AI evaluation; K-10 budget/team assumptions unquoted; K-11 complex tenancy/access policy unresolved; K-12 no-software-tests statement is historical (46 tests now pass), but full release testing remains RT-007. Original records preserved in ../rental-trust-research/development-plan/KNOWN-ISSUES.md.

No currently observed high-severity unauthorized handover access defect; this is limited to executed tests and is not a penetration-test conclusion.
