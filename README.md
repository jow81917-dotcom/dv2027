# DV Pre-Registration Assistance

Independent private service — not affiliated with the U.S. government.

## Stack

- Frontend: React 18 + Vite + TypeScript + React Router v6 + plain CSS
- Database: Neon (serverless PostgreSQL)
- File storage: Vercel Blob (private)
- Server: Vercel Serverless Functions (`api/*.ts`)
- Hosting: Vercel Hobby

## Setup

### 1. Neon database

1. Go to [neon.tech](https://neon.tech) and create a free project.
2. Open the **SQL Editor** and run the contents of `supabase_schema.sql` — or run this minimal schema:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL DEFAULT 'DVR-' || upper(substring(encode(gen_random_bytes(4), 'hex'), 1, 8)),
  first_name text NOT NULL, middle_name text, last_name text NOT NULL,
  gender text, birth_date date, birth_city text, birth_country text,
  email text, phone text NOT NULL, country_of_residence text,
  marital_status text, children_count int DEFAULT 0, spouse_details text,
  education text, school text, occupation text, work_years int DEFAULT 0,
  id_type text DEFAULT 'passport', id_number text, consent boolean DEFAULT false,
  status text DEFAULT 'pending_payment',
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX ON applicants (phone, lower(last_name));
CREATE INDEX ON applicants (phone);
CREATE INDEX ON applicants (status);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER applicants_updated_at BEFORE UPDATE ON applicants FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid REFERENCES applicants(id) ON DELETE CASCADE,
  method text DEFAULT 'Telebirr', amount numeric DEFAULT 350.00,
  payer_name text NOT NULL, transaction_reference text NOT NULL,
  proof_url text, verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION lookup_status(p_ref text, p_phone text)
RETURNS TABLE(reference text, first_name text, status text, created_at timestamptz)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT reference, first_name, status, created_at FROM applicants
  WHERE reference = p_ref AND phone = p_phone LIMIT 1;
$$;
```

3. Copy the **Connection string** from Neon dashboard (Settings → Connection Details). Use the pooled connection string.

### 2. Vercel Blob store

1. Go to your Vercel project → **Storage → Create store → Blob**.
2. Name it `dv-payment-proofs`, set to **Private**.
3. Vercel auto-injects `BLOB_READ_WRITE_TOKEN` into your serverless functions.

### 3. Environment variables

Copy `.env.example` to `.env` for local dev and fill in:

```
VITE_TELEBIRR_NUMBER=09XXXXXXXX
VITE_TELEBIRR_NAME=Your Full Name
VITE_TELEGRAM_HANDLE=suceessprime1
VITE_ID_ENC_KEY=<base64 of 32 random bytes>

DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX
```

Generate `VITE_ID_ENC_KEY` in your browser console:
```js
const key = await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']);
const raw = await crypto.subtle.exportKey('raw',key);
console.log(btoa(String.fromCharCode(...new Uint8Array(raw))));
```

In Vercel dashboard add all 6 variables under **Settings → Environment Variables**.

### 4. Install and run locally

```bash
npm install
npm run dev
```

For local serverless functions use Vercel CLI:
```bash
npm i -g vercel
vercel dev
```

### 5. Deploy

```bash
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deploys.
