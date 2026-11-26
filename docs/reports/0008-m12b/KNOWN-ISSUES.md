# BUILD RENTAL TRUST — known issues at M1.2B

| ID | Severity | Description / impact | Recommended fix | Blocking |
|---|---|---|---|---|
| RT-011 | High | Google Maps credentials/billing unavailable; real pin confirmation cannot be tested. | Obtain owner approval and restricted keys, then browser-verify. | Publication |
| RT-018 | Medium | Enabled Google UI/provider behavior remains untested against live Google. | Test only when configured. | M1.2A acceptance |
| RT-003 | High | Local-only evidence/photo storage has no production scanning, encryption-key/retention policy or external object storage. PDFs quarantined. | Build approved secure pipeline before real files. | Production |
| RT-019 | Medium | Chrome automation extension cannot attach local files because file-URL access is off; end-to-end browser evidence/photo test incomplete. | Use permitted upload path or approve extension setting, then retest. | M1.2B acceptance |
| RT-020 | High | Identity verification has no separate evidence/provider workflow; reviewer identity approval is blocked. | Add approved identity process. | Identity acceptance |
| RT-021 | Medium | Photo EXIF stripping/content scanning and version policy for evidentiary photos absent. | Add before production. | Production photos |
| RT-022 | Medium | Reviewer queue does not automatically refresh after decisions. | Reload queue after save. | UX |
| RT-014 | High | Historical Prompt 004 source/original DB absent; prior 75-test claims are unreproducible. | Recover verified backup separately if available. | History gap |
| RT-013 | High | Payments, maintenance, reviews and passport remain incomplete. | Follow staged product roadmap. | Full product |
| RT-015 | Medium | No approved live AI provider/consent/audit pipeline. | Add scoped, reviewed integration later. | Live AI |
| RT-004 | High | Production email/MFA/recovery and trusted proxy policy incomplete. | Configure before real users. | Production |
| RT-002 | High | External PostgreSQL deployment and hosted CI unverified. | Validate in deployment stage. | Deployment |
| RT-005/006/007/009 | Medium | Legal/privacy pilot, full handover, broad accessibility/security acceptance and research bundle open. | Continue staged roadmap. | Release |

Earlier issue details and test failures remain in `docs/reports/0001/` through `0007-m12a/`. Prompt 008 restricted full test run failed 13 HTTP cases with local bind `EPERM` and one outdated migration-count assertion; the permitted final rerun passed 79/79. No issue was silently removed.
