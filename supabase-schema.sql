-- Extension nécessaire pour uuid si non activée
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Schéma applicatif
create schema if not exists app;

-- Table des documents DIC importés
create table if not exists app.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  mime_type text not null,
  file_size bigint,
  storage_path text not null,              -- chemin dans storage
  status text not null default 'uploaded'  -- uploaded | processing | ready | failed
    check (status in ('uploaded','processing','ready','failed')),
  extracted jsonb not null default '{}'::jsonb,  -- futur: données extraites
  summary jsonb not null default '{}'::jsonb,    -- futur: synthèse pour dashboard
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index
create index if not exists documents_user_id_idx on app.documents(user_id);
create index if not exists documents_created_at_idx on app.documents(created_at desc);
create index if not exists documents_extracted_gin on app.documents using gin (extracted);

-- Trigger updated_at
create or replace function app.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_documents_touch on app.documents;
create trigger trg_documents_touch
before update on app.documents
for each row execute procedure app.touch_updated_at();

-- Activer RLS
alter table app.documents enable row level security;

-- Politiques RLS
drop policy if exists "doc_select_own" on app.documents;
drop policy if exists "doc_insert_own" on app.documents;
drop policy if exists "doc_update_own" on app.documents;
drop policy if exists "doc_delete_own" on app.documents;

create policy "doc_select_own"
  on app.documents for select
  using (auth.uid() = user_id);

create policy "doc_insert_own"
  on app.documents for insert
  with check (auth.uid() = user_id);

create policy "doc_update_own"
  on app.documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "doc_delete_own"
  on app.documents for delete
  using (auth.uid() = user_id);

-- Bucket de stockage privé pour les DIC
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dic-documents', 'dic-documents', false, 52428800, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- Politiques Storage pour le bucket dic-documents
-- RLS est activé par défaut sur storage.objects
-- Données privées: seuls les propriétaires peuvent lire/écrire leurs fichiers

-- SELECT
drop policy if exists "storage_select_own_dic" on storage.objects;
create policy "storage_select_own_dic"
on storage.objects for select
to authenticated
using (
  bucket_id = 'dic-documents'
  and owner = auth.uid()
);

-- INSERT
drop policy if exists "storage_insert_own_dic" on storage.objects;
create policy "storage_insert_own_dic"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'dic-documents'
  and owner = auth.uid()
);

-- UPDATE
drop policy if exists "storage_update_own_dic" on storage.objects;
create policy "storage_update_own_dic"
on storage.objects for update
to authenticated
using (
  bucket_id = 'dic-documents'
  and owner = auth.uid()
)
with check (
  bucket_id = 'dic-documents'
  and owner = auth.uid()
);

-- DELETE
drop policy if exists "storage_delete_own_dic" on storage.objects;
create policy "storage_delete_own_dic"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'dic-documents'
  and owner = auth.uid()
);
