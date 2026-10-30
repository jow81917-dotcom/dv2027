CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE applicants (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference            text UNIQUE NOT NULL DEFAULT 'DVR-' || upper(substring(encode(gen_random_bytes(4), 'hex'), 1, 8)),
  first_name           text NOT NULL,
  middle_name          text,
  last_name            text NOT NULL,
  gender               text,
  birth_date           date,
  birth_city           text,
  birth_country        text,
  email                text,
  phone                text NOT NULL,
  country_of_residence text,
  marital_status       text,
  children_count       int DEFAULT 0,
  spouse_details       text,
  education            text,
  school               text,
  occupation           text,
  work_years           int DEFAULT 0,
  id_type              text DEFAULT 'passport',
  id_number            text,
  consent              boolean DEFAULT false,
  status               text DEFAULT 'pending_payment',
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX ON applicants (phone, lower(last_name));
CREATE INDEX ON applicants (phone);
CREATE INDEX ON applicants (status);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER applicants_updated_at
  BEFORE UPDATE ON applicants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE payments (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id          uuid REFERENCES applicants(id) ON DELETE CASCADE,
  method                text DEFAULT 'Telebirr',
  amount                numeric DEFAULT 350.00,
  payer_name            text NOT NULL,
  transaction_reference text NOT NULL,
  proof_url             text,
  verified              boolean DEFAULT false,
  created_at            timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION lookup_status(p_ref text, p_phone text)
RETURNS TABLE(reference text, first_name text, status text, created_at timestamptz)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT reference, first_name, status, created_at
  FROM applicants
  WHERE reference = p_ref AND phone = p_phone
  LIMIT 1;
$$;
