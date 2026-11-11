# Known issues — Prompt 002

## D. Defects and blockers
| ID | Severity | Description / impact | Recommended fix | Blocking status |
|---|---|---|---|---|
| RT-001 | Resolved for initial baseline | Missing Git repository/commit addressed by main and initial GitHub push. | Preserve history; normal commits and reviewed pushes. | No longer blocks source versioning |
| RT-002 | High | Standard PostgreSQL and hosted CI outcomes unverified. | Run dedicated database checks and inspect hosted workflow. | Deployment assurance blocked |
| RT-003 | High | No production file scan/encrypted object storage; PDF quarantine and missing handover photos remain. | Complete private file/scan pipeline. | Real-file workflow blocked |
| RT-004 | High | Production auth/email/MFA and trusted IP rate-limit configuration unresolved. | Production authentication and boundary tests. | Production access blocked |
| RT-005 | High | Real-data legal/privacy and demand validation unresolved. | Owner/adviser validation. | Real-data pilot blocked |
| RT-006 | Medium | Handover label matching and missing photo/signature/deposit workflows. | Stable inventory identities and scoped next modules. | Full D3 incomplete |
| RT-007 | Medium | New HTTP permission regressions, accessibility/security/load/restore checks absent. | Next recommended endpoint verification task. | Full release acceptance blocked |
| RT-008 | Low | Existing preview tabs may retain restart connection errors. | Graceful restart/reconnect improvements. | Local workaround available |
| RT-009 | Low | Historical links reference sibling research outside Git repository. | Preserve workspace; separately approve a publication-ready research bundle if wanted. | Does not block app build |

Original K-01–K-12 risks and earlier reports remain preserved. No newly discovered runtime defect in this Git-only cycle.


Prior issue details retained at docs/reports/0002/previous-KNOWN-ISSUES.md and docs/reports/0001.
