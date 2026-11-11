# Known issues — Prompt 003

## D. Defects and blockers
| ID | Severity | Description / affected feature / impact | Recommended fix | Blocking status |
|---|---|---|---|---|
| RT-010 | Medium, resolved | Unsupported charset exposed default HTML API error response. | Shared API parser handler now returns JSON 415; regression passes. | Resolved for demonstrated case |
| RT-007 | Medium, partially resolved | Evidence/handover HTTP coverage now exists; broader release/security/accessibility/load/restore checks absent. | Continue staged verification. | Full release acceptance blocked |
| RT-002 | High | Standard PostgreSQL and hosted CI outcomes unverified. | Next recommended database verification. | Deployment assurance blocked |
| RT-003 | High | Production scanning/encrypted storage and handover photos absent; PDFs quarantined. | Complete private file pipeline. | Real-file workflows blocked |
| RT-004 | High | Production email/MFA/recovery and trusted-client-IP configuration unresolved. Tests use fictional forwarded client addresses only. | Configure and test production auth/proxy trust. | Production access blocked |
| RT-005 | High | Real-data privacy/legal and demand validation unresolved. | Owner/adviser validation. | Real-data pilot blocked |
| RT-006 | Medium | Label-based handover matching; photos/signatures/settlement incomplete. | Stable item identities and scoped workflows. | Full D3 incomplete |
| RT-008 | Low | Preview reconnection after restart can be stale; process not restarted in this cycle. | Improve graceful restart/reconnection. | Non-blocking locally |
| RT-009 | Low | Historical sibling-research links require original workspace. | Separately approve publishable research bundle if needed. | No build block |

RT-001 (missing Git baseline) remains resolved. Prior K-01–K-12 and earlier reports preserved. No unauthorized-access defect was observed in the defined cases; this is not a full security assessment.


Historical issue records retained under docs/reports/0003/previous-KNOWN-ISSUES.md and earlier cycles.
