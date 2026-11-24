CREATE TABLE property_verifications (
 property_id uuid PRIMARY KEY REFERENCES properties(id),
 claimant_id text NOT NULL REFERENCES auth_user(id),
 relationship text NOT NULL CHECK(relationship IN ('owner','authorized_landlord','registered_agent','property_manager','company_representative')),
 identity_status text NOT NULL DEFAULT 'not_started',
 ownership_status text NOT NULL DEFAULT 'not_started',
 rental_authority_status text NOT NULL DEFAULT 'not_started',
 review_status text NOT NULL DEFAULT 'not_started',
 submitted_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE property_evidence (
 id uuid PRIMARY KEY, property_id uuid NOT NULL REFERENCES properties(id), uploader_id text NOT NULL REFERENCES auth_user(id),
 category text NOT NULL CHECK(category IN ('land_title','strata_title','sale_purchase_agreement','official_land_search','owner_authorization','management_agreement','agent_registration','company_authorization','other')),
 filename text NOT NULL, mime_type text NOT NULL CHECK(mime_type IN ('text/plain','application/pdf')),
 byte_size integer NOT NULL CHECK(byte_size BETWEEN 1 AND 2097152), sha256 text NOT NULL CHECK(length(sha256)=64),
 content_base64 text NOT NULL, file_state text NOT NULL CHECK(file_state IN ('reviewable_text','quarantined')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(property_id,category,sha256)
);
CREATE INDEX property_evidence_property_idx ON property_evidence(property_id,created_at);
CREATE TABLE property_review_decisions (
 id uuid PRIMARY KEY, property_id uuid NOT NULL REFERENCES properties(id), reviewer_id text NOT NULL REFERENCES auth_user(id),
 check_type text NOT NULL CHECK(check_type IN ('identity','ownership','rental_authority','overall')),
 decision text NOT NULL CHECK(decision IN ('under_review','more_information_required','verified','rejected','expired','suspended')),
 reason text NOT NULL CHECK(length(reason) BETWEEN 10 AND 1000), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX property_review_property_idx ON property_review_decisions(property_id,created_at);
CREATE TABLE reviewer_grants (user_id text PRIMARY KEY REFERENCES auth_user(id),granted_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE property_photos (
 id uuid PRIMARY KEY,property_id uuid NOT NULL REFERENCES properties(id),uploader_id text NOT NULL REFERENCES auth_user(id),
 filename text NOT NULL,mime_type text NOT NULL CHECK(mime_type IN ('image/jpeg','image/png','image/webp')),
 byte_size integer NOT NULL CHECK(byte_size BETWEEN 1 AND 1048576),sha256 text NOT NULL CHECK(length(sha256)=64),content_base64 text NOT NULL,
 room_area text NOT NULL CHECK(length(room_area) BETWEEN 2 AND 80),sort_order integer NOT NULL DEFAULT 0,
 is_cover boolean NOT NULL DEFAULT false,is_current boolean NOT NULL DEFAULT true,removed_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(property_id,sha256)
);
CREATE INDEX property_photos_property_idx ON property_photos(property_id,sort_order,created_at);
