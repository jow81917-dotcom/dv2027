-- ============================================================
-- 1. APPLICANTS TABLE
-- ============================================================
create table applicants (
  id                   uuid primary key default gen_random_uuid(),
  reference            text unique not null default 'DVR-' || upper(substring(replace(gen_random_uuid()::text,'-',''),1,8)),
  first_name           text not null,
  middle_name          text,
  last_name            text not null,
  gender               text,
  birth_date           date,
  birth_city           text,
  birth_country        text,
  email                text,
  phone                text not null,
  country_of_residence text,
  marital_status       text,
  children_count       integer default 0,
  spouse_details       text,
  education            text,
  school               text,
  occupation           text,
  work_years           integer default 0,
  id_type              text default 'passport',
  id_number            text,           -- stored encrypted (AES-GCM from frontend)
  consent              boolean default false,
  status               text default 'pending_payment',
  created_at           timestamptz default now()
);

-- ============================================================
-- 2. PAYMENTS TABLE
-- ============================================================
create table payments (
  id             uuid primary key default gen_random_uuid(),
  applicant_id   uuid references applicants(id) on delete cascade,
  payer_name     text not null,
  transaction_ref text not null,
  proof_path     text,                 -- storage path in payment-proofs bucket
  method         text default 'Telebirr',
  amount         numeric default 350,
  created_at     timestamptz default now()
);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================
alter table applicants enable row level security;
alter table payments    enable row level security;

-- Anon users: INSERT only (no SELECT, UPDATE, DELETE)
create policy "anon insert applicants"
  on applicants for insert
  to anon
  with check (true);

-- Anon users: INSERT only on payments (via RPC only — see below)
create policy "anon insert payments"
  on payments for insert
  to anon
  with check (true);

-- ============================================================
-- 4. lookup_status RPC  (used by Status page)
-- ============================================================
create or replace function lookup_status(p_ref text, p_phone text)
returns table (
  reference   text,
  first_name  text,
  status      text,
  created_at  timestamptz
)
language sql security definer as $$
  select reference, first_name, status, created_at
  from applicants
  where reference = p_ref
    and phone     = p_phone
  limit 1;
$$;

-- ============================================================
-- 5. submit_payment RPC  (used by Payment page)
--    Resolves reference → applicant_id without exposing SELECT
-- ============================================================
create or replace function submit_payment(
  p_ref           text,
  p_phone         text,
  p_payer_name    text,
  p_transaction   text,
  p_proof_path    text
)
returns text        -- returns 'ok' or raises an error
language plpgsql security definer as $$
declare
  v_id uuid;
begin
  select id into v_id
  from applicants
  where reference = p_ref
    and phone     = p_phone
  limit 1;

  if v_id is null then
    raise exception 'No matching registration found.';
  end if;

  insert into payments(applicant_id, payer_name, transaction_ref, proof_path)
  values (v_id, p_payer_name, p_transaction, p_proof_path);

  update applicants set status = 'payment_submitted' where id = v_id;

  return 'ok';
end;
$$;

-- ============================================================
-- 6. STORAGE BUCKET  (run this separately or create manually)
-- ============================================================
-- Create a PRIVATE bucket named "payment-proofs" in the
-- Supabase dashboard (Storage → New bucket → private).
-- Then apply this policy so anon users can upload only:

-- insert into storage.buckets (id, name, public) values ('payment-proofs', 'payment-proofs', false);

create policy "anon upload payment proofs"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'payment-proofs');
