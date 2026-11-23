CREATE TABLE property_listings (
 property_id uuid PRIMARY KEY REFERENCES properties(id),
 unit_details text NOT NULL DEFAULT '', building_details text NOT NULL DEFAULT '',
 rent_minor integer, security_deposit_minor integer, other_charges_minor integer NOT NULL DEFAULT 0,
 bedrooms integer, bathrooms integer, floor_area_sqm numeric(10,2),
 furnishing text NOT NULL DEFAULT 'unspecified', parking integer NOT NULL DEFAULT 0,
 occupancy_capacity integer, available_on date, minimum_months integer,
 facilities text NOT NULL DEFAULT '', amenities text NOT NULL DEFAULT '', description text NOT NULL DEFAULT '',
 photo_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
 listing_status text NOT NULL DEFAULT 'draft' CHECK(listing_status IN ('draft','published','paused','withdrawn')),
 latitude numeric(10,7), longitude numeric(10,7), google_place_id text,
 location_status text NOT NULL DEFAULT 'not_submitted' CHECK(location_status IN ('not_submitted','submitted','under_review','evidence_confirmed','disputed','rejected')),
 location_source text, location_checked_at timestamptz,
 rail_station text, walk_distance_m integer, walk_time_min integer, transit_route text,
 transit_source text, transit_checked_at timestamptz,
 direct_station_connection boolean NOT NULL DEFAULT false,
 direct_connection_evidence text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
 CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
 CHECK ((latitude IS NULL) = (longitude IS NULL))
);
CREATE TABLE property_location_history (
 id uuid PRIMARY KEY, property_id uuid NOT NULL REFERENCES properties(id), actor_id text NOT NULL REFERENCES auth_user(id),
 address text NOT NULL, latitude numeric(10,7), longitude numeric(10,7), google_place_id text,
 status text NOT NULL, reason text NOT NULL, recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX property_location_history_property_idx ON property_location_history(property_id,recorded_at);
