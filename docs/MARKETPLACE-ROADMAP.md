# Marketplace contracts after M1.2

M1.2 persists private listing drafts in `property_listings`. The `GET /api/v1/listings` read model returns only published listings with coordinates, a Google Place ID and a non-rejected location status. No current record qualifies. A submitted pin is not an evidence-confirmed location, and neither state verifies ownership or agent authority. Photos, map selection, walking routes and Street View have no live service in this checkpoint.

## M1.3: tenant requests and matching

Planned `rental_requests`: tenant owner, lifecycle (`draft`, `active`, `withdrawn`), selected map center and radius in kilometres, preferred budget, separately approved absolute maximum, optional flexibility, move-in date, household size, occupancy needs, preferred property type, furnishing, parking and transit needs. Multiple preferred areas come later. Each criterion carries `must_have`, `preferred` or `optional`; user-defined requirements keep the same strength and text. Preserve edits and withdrawal history. No request record or tenant flow has been implemented yet.

Deterministic matching must first reject listings that violate mandatory criteria or the tenant's absolute maximum budget. A missing mandatory property fact is `unknown` and cannot be treated as a pass. Rank eligible listings by explicit preferences using clear, inspectable calculations. The AI Rental Trust Engine may explain trade-offs only after permission checks, evidence loading and consent; it cannot waive a must-have condition or invent a location, walking route, property attribute or confidence score. Explanations require cited source versions, missing-data indicators and a correction path. Protected traits, inferred personality and hidden housing scores are excluded.

## M1.4: tenant-controlled offers and viewings

Planned `offers`: request ID, eligible published listing ID, authorized sender, consent grant, creation/expiry, accepted/rejected/withdrawn state and anti-spam counter. The tenant must explicitly permit contact and may revoke that permission. Pre-acceptance matching exposes limited request criteria and approximate search area, never identity documents, exact movement history, private messages, financial reports or a full profile. The offer price must fall within the tenant's approved range; preferred budget is not permission to exceed it. A landlord/agent must have a real eligible listing and verified authority before sending an offer. Viewing requests and appointments follow offer acceptance; completed viewings remain separate from scheduled appointments.

## Location and transit evidence

`property_location_history` stores previous addresses and any prior coordinates before edits. Future Google Maps picker must capture selected coordinates and Place ID server-side, recheck address/place consistency, flag large moves and duplicates, and keep an audit record. The user-selected pin starts as `submitted`; evidence review alone may advance it to `evidence_confirmed`. Street View needs an availability check and imagery date; its imagery must be labeled as nearby street-level imagery, never the actual unit. Walking distance/time must come from a route source, not a straight-line calculation. Direct station connection needs separate documentary evidence. Current columns reserve these fields, but no route or Street View data is populated.

## External dependency

No approved Google Maps credential, billing authorization or server-side configuration is present. Address autocomplete, map picker, pin dragging, map confirmation, route calculations and Street View availability are blocked. The listing API therefore rejects publication without a persisted map location. No private credential is embedded in the client and no paid integration was activated.
