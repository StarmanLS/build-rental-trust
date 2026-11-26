ALTER TABLE property_review_decisions DROP CONSTRAINT property_review_decisions_decision_check;
ALTER TABLE property_review_decisions ADD CONSTRAINT property_review_decisions_decision_check CHECK(decision IN ('under_review','more_information_required','document_reviewed','verified','rejected','expired','suspended'));

-- Earlier local decisions used 'verified' for a document review. Preserve the
-- append-only decisions while narrowing the current claim's meaning.
UPDATE property_verifications SET ownership_status='document_reviewed' WHERE ownership_status='verified';
UPDATE property_verifications SET rental_authority_status='document_reviewed' WHERE rental_authority_status='verified';
UPDATE property_verifications SET review_status='document_reviewed' WHERE review_status='verified';
UPDATE claims SET status='document_reviewed' WHERE status='verified';

ALTER TABLE property_photos ADD COLUMN source_sha256 text CHECK(source_sha256 IS NULL OR length(source_sha256)=64);
CREATE TABLE property_photo_history (
 id uuid PRIMARY KEY,
 photo_id uuid NOT NULL REFERENCES property_photos(id),
 actor_id text NOT NULL REFERENCES auth_user(id),
 action text NOT NULL CHECK(action IN ('uploaded','cover','up','down','stale','remove','label')),
 old_room_area text,
 new_room_area text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX property_photo_history_photo_idx ON property_photo_history(photo_id,created_at);
