CREATE TABLE user_roles (
 user_id text NOT NULL REFERENCES auth_user(id),
 role text NOT NULL CHECK(role IN ('tenant','landlord')),
 setup_completed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,role)
);
CREATE TABLE user_preferences (
 user_id text PRIMARY KEY REFERENCES auth_user(id),
 active_role text CHECK(active_role IN ('tenant','landlord')),
 display_name text,
 language text NOT NULL DEFAULT 'en' CHECK(language IN ('en','ms')),
 updated_at timestamptz NOT NULL DEFAULT now()
);
