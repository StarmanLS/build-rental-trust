# BUILD RENTAL TRUST — known issues at Prompt 009

| ID | Severity | Description / impact | Recommended fix | Blocking |
|---|---|---|---|---|
| RT-011 | High | No approved Google Maps credentials/billing; live pin confirmation and publication cannot be accepted. | Configure restricted keys with owner approval; browser verify. | Publication / M1.2A |
| RT-018 | Medium | Live Google provider behavior remains untested. | Test when access is configured. | M1.2A |
| RT-003 | High | Local synthetic evidence/photos lack production malware scanning, secure object storage, retention and key management. PDFs remain quarantined. | Build and security review the production pipeline before real uploads. | Real files |
| RT-020 | High | Independent identity verification remains unavailable. Document review does not establish official ownership. | Add approved identity/registry checks and reviewer safeguards. | Official verification |
| RT-021 | Medium | EXIF/GPS stripping is now implemented, but content scanning and evidentiary photo version policy are absent. | Define retention/version rules and scanner before production use. | Real photos |
| RT-023 | Low | Chrome may log expected 401 after sign-out and 404 after soft-removing a photo as an in-flight image request. No 5xx/page exception occurred in the passing workflow. | Avoid stale image requests if this becomes user-visible. | No |
| RT-014 | High | Historical Prompt 004 source/original DB absent; earlier test claims cannot be reproduced. | Recover a verified backup separately if available. | History gap |
| RT-013 | High | Payments, maintenance, reviews and passport remain incomplete. | Follow staged roadmap. | Full product |
| RT-015 | Medium | No approved live AI provider/consent/audit pipeline. | Add a reviewed integration later. | Live AI |
| RT-004 | High | Production email/MFA/recovery and trusted proxy policy incomplete. | Configure before real users. | Production |
| RT-002 | High | Hosted PostgreSQL and deployment remain unverified. | Validate in deployment stage. | Deployment |
| RT-005/006/007/009 | Medium | Legal/privacy pilot, full handover, broad accessibility/security acceptance and research bundle remain open. | Continue staged roadmap. | Release |

Resolved this cycle: RT-019 browser upload limitation through Playwright and installed Chrome; RT-022 reviewer queue refresh; EXIF portion of RT-021. Prior issue history is preserved in `docs/reports/0008-m12b/` and earlier archives.
