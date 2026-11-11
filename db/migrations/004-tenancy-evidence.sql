CREATE TABLE tenancy_documents (
 id uuid PRIMARY KEY,
 tenancy_id uuid NOT NULL REFERENCES tenancies(id),
 uploader_id text NOT NULL REFERENCES auth_user(id),
 kind text NOT NULL CHECK(kind IN ('agreement','stamp_evidence','supporting')),
 version integer NOT NULL CHECK(version>0),
 related_agreement_id uuid REFERENCES tenancy_documents(id),
 filename text NOT NULL,
 mime_type text NOT NULL CHECK(mime_type IN ('text/plain','application/pdf')),
 byte_size integer NOT NULL CHECK(byte_size BETWEEN 1 AND 2097152),
 sha256 text NOT NULL CHECK(length(sha256)=64),
 content_base64 text NOT NULL CHECK(length(content_base64)<=2796204),
 file_state text NOT NULL CHECK(file_state IN ('text_only','quarantined')),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenancy_id,kind,version),
 UNIQUE(tenancy_id,kind,sha256),
 CHECK((mime_type='text/plain' AND file_state='text_only') OR (mime_type='application/pdf' AND file_state='quarantined')),
 CHECK(kind<>'stamp_evidence' OR related_agreement_id IS NOT NULL)
);
CREATE INDEX tenancy_documents_tenancy_idx ON tenancy_documents(tenancy_id,created_at);
CREATE TABLE document_responses (
 id uuid PRIMARY KEY,
 document_id uuid NOT NULL REFERENCES tenancy_documents(id),
 user_id text NOT NULL REFERENCES auth_user(id),
 response text NOT NULL CHECK(response IN ('received','disputed')),
 note text NOT NULL DEFAULT '' CHECK(length(note)<=500),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX document_responses_document_idx ON document_responses(document_id,created_at);
