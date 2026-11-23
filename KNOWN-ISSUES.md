# BUILD RENTAL TRUST — known issues at M1.1

| ID | Severity | Description / affected feature | Current impact | Recommended fix | Blocking |
|---|---|---|---|---|---|
| RT-008 | High, locally resolved | Preview was refused because no server/source was present; earlier shutdown left a dev lock. | Current port 5199 runs and restarts cleanly, but a local process must remain running. | Keep server alive; use `npm run dev` if host session ends. | No current block |
| RT-014 | High | Prompt 004 source and original local DB were absent; only report text survived. | Historical 75-test and Maps/verification claims cannot be reproduced. | Recover a separate verified backup if one exists; otherwise reimplement in later milestones. | Recovery gap |
| RT-011 | High | Mandatory map pin and persisted coordinates missing. | Property registration lacks location confirmation. | M1.2 Maps integration and validation. | M1.2 |
| RT-012 | High | Identity, ownership and rental-authority evidence/review absent. | Claims remain unverified. | Secure evidence storage, reviewer roles, audit and seven-state review. | Verification |
| RT-013 | High | Payments, maintenance, reviews, passport and future viewing schedules have no complete record workflows. | Dashboard tiles use honest empty states. | Implement in their approved milestones with permission checks. | Full product |
| RT-015 | Medium | No approved AI provider, consent store, redaction/audit pipeline or live AI workflow. | AI contract tested; no AI result generated. | Approve provider/data handling and add scoped integration. | Live AI |
| RT-004 | High | Production email/MFA/recovery and trusted proxy policy incomplete. | Local accounts only; shared rate-bucket warning may appear. | Configure and test before real users. | Production |
| RT-003 | High | Real-file scanning and storage absent; PDFs stay quarantined. | Real document workflow unavailable. | Secure file pipeline. | Real files |
| RT-002 | High | Standard PostgreSQL deployment and hosted CI unverified. | Deployment assurance incomplete. | Separate infrastructure validation. | Deployment |
| RT-005/006/007/009 | Medium | Legal/privacy pilot, complete handover, broad accessibility/security acceptance and research bundle remain open. | Release readiness incomplete. | Follow approved staged roadmap. | Release |

Prior issue history is preserved in `docs/reports/0001/` through `0003/` and `docs/reports/0004-unpushed/`. No issue was silently removed.
