CREATE TABLE handovers (
 id uuid PRIMARY KEY,
 tenancy_id uuid NOT NULL REFERENCES tenancies(id),
 author_id text NOT NULL REFERENCES auth_user(id),
 phase text NOT NULL CHECK(phase IN ('move_in','move_out')),
 version integer NOT NULL CHECK(version>0),
 observed_on date NOT NULL,
 baseline_id uuid REFERENCES handovers(id),
 items jsonb NOT NULL CHECK(jsonb_typeof(items)='array'),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenancy_id,phase,version),
 CHECK((phase='move_in' AND baseline_id IS NULL) OR (phase='move_out' AND baseline_id IS NOT NULL))
);
CREATE TABLE handover_responses (
 id uuid PRIMARY KEY,
 handover_id uuid NOT NULL REFERENCES handovers(id),
 item_id uuid NOT NULL,
 user_id text NOT NULL REFERENCES auth_user(id),
 response text NOT NULL CHECK(response IN ('acknowledged','disputed')),
 note text NOT NULL CHECK(length(note)<=500),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX handovers_tenancy_idx ON handovers(tenancy_id,created_at);
CREATE INDEX handover_responses_report_idx ON handover_responses(handover_id,created_at);
