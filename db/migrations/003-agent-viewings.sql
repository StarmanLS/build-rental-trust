ALTER TABLE user_roles DROP CONSTRAINT user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check CHECK(role IN ('tenant','landlord','agent'));
ALTER TABLE user_preferences DROP CONSTRAINT user_preferences_active_role_check;
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_active_role_check CHECK(active_role IN ('tenant','landlord','agent'));
CREATE TABLE property_viewings (
 id uuid PRIMARY KEY,
 agent_id text NOT NULL REFERENCES auth_user(id),
 tenant_id text NOT NULL REFERENCES auth_user(id),
 property_id uuid NOT NULL REFERENCES properties(id),
 viewed_on date NOT NULL,
 status text NOT NULL DEFAULT 'reported' CHECK(status IN ('reported','confirmed','disputed')),
 created_at timestamptz NOT NULL DEFAULT now(),
 responded_at timestamptz,
 UNIQUE(agent_id,tenant_id,property_id,viewed_on),
 CHECK(agent_id <> tenant_id)
);
CREATE INDEX property_viewings_agent_idx ON property_viewings(agent_id,tenant_id);
CREATE INDEX property_viewings_tenant_idx ON property_viewings(tenant_id);
