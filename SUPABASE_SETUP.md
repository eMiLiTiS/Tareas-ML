# Supabase Setup

## 1. Create the project

Create a new Supabase project and wait until the database is ready.

## 2. Enable Auth

In `Authentication > Providers`, enable `Email`.

Recommended for testing:

- Enable email/password sign-ins
- Disable email confirmation temporarily if you want immediate access after sign-up

If you keep email confirmation enabled, new users must confirm their email before logging in.

## 3. Run this SQL

Open `SQL Editor` in Supabase and run:

```sql
create extension if not exists pgcrypto;

create table if not exists patients (
  id uuid primary key,
  nombre text not null,
  telefono text not null,
  historial_resumido text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null,
  paciente_nombre text not null,
  tratamiento text not null,
  fecha date not null,
  hora text not null,
  estado text not null check (estado in ('proxima', 'realizada', 'cancelada')),
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists task_templates (
  id uuid primary key,
  titulo text not null,
  descripcion text,
  categoria text not null check (categoria in ('apertura', 'cierre', 'limpieza', 'cabina', 'revision', 'administrativa', 'comercial')),
  area text not null check (area in ('estetica', 'fisioterapia', 'general')),
  tipo_respuesta text not null check (tipo_respuesta in ('boolean', 'number')),
  prioridad text not null check (prioridad in ('alta', 'media', 'baja')),
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key,
  titulo text not null,
  descripcion text,
  categoria text not null check (categoria in ('apertura', 'cierre', 'limpieza', 'cabina', 'revision', 'administrativa', 'comercial')),
  area text not null check (area in ('estetica', 'fisioterapia', 'general')),
  tipo_respuesta text not null check (tipo_respuesta in ('boolean', 'number')),
  valor_respuesta jsonb,
  estado text not null check (estado in ('pendiente', 'respondida')),
  prioridad text not null check (prioridad in ('alta', 'media', 'baja')),
  fecha date not null,
  paciente_id uuid,
  tratamiento text,
  created_at timestamptz not null default now()
);

create table if not exists worker_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nombre text not null default '',
  puesto text not null default '',
  telefono text not null default '',
  notas text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_appointments_fecha on appointments (fecha);
create index if not exists idx_tasks_fecha on tasks (fecha);

alter table appointments
  alter column id set default gen_random_uuid();

alter table appointments
  add column if not exists created_by uuid,
  add column if not exists updated_by uuid,
  add column if not exists updated_at timestamptz not null default now();

update appointments
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_created_by_fkey'
  ) then
    alter table appointments
      add constraint appointments_created_by_fkey
      foreign key (created_by) references auth.users(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_updated_by_fkey'
  ) then
    alter table appointments
      add constraint appointments_updated_by_fkey
      foreign key (updated_by) references auth.users(id) on delete set null;
  end if;
end $$;

create index if not exists idx_appointments_created_by on appointments (created_by);
create index if not exists idx_appointments_updated_by on appointments (updated_by);

create or replace function set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_appointments_set_updated_at on appointments;
create trigger trg_appointments_set_updated_at
before update on appointments
for each row
execute function set_updated_at_timestamp();

alter table patients enable row level security;
alter table appointments enable row level security;
alter table task_templates enable row level security;
alter table tasks enable row level security;
alter table worker_profiles enable row level security;

drop policy if exists "public full access patients" on patients;
drop policy if exists "authenticated full access patients" on patients;
drop policy if exists "public full access appointments" on appointments;
drop policy if exists "authenticated full access appointments" on appointments;
drop policy if exists "public full access task_templates" on task_templates;
drop policy if exists "authenticated full access task_templates" on task_templates;
drop policy if exists "public full access tasks" on tasks;
drop policy if exists "authenticated full access tasks" on tasks;
drop policy if exists "read own worker profile" on worker_profiles;
drop policy if exists "insert own worker profile" on worker_profiles;
drop policy if exists "update own worker profile" on worker_profiles;

create policy "authenticated full access patients"
on patients
for all
to authenticated
using (true)
with check (true);

create policy "authenticated full access appointments"
on appointments
for all
to authenticated
using (true)
with check (true);

create policy "authenticated full access task_templates"
on task_templates
for all
to authenticated
using (true)
with check (true);

create policy "authenticated full access tasks"
on tasks
for all
to authenticated
using (true)
with check (true);

create policy "read own worker profile"
on worker_profiles
for select
to authenticated
using (auth.uid() = id);

create policy "insert own worker profile"
on worker_profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "update own worker profile"
on worker_profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
```

## 4. Add env vars

Create a local `.env` file based on `.env.example`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## 5. Start the app

Run:

```bash
npm run dev
```

## Notes

- If Supabase is not configured, the app still works with localStorage.
- If Supabase is configured, the app requires login before showing any data.
- On the first authenticated connection, the app uploads the current local seed/local data into Supabase if the remote tables are empty.
- On the first authenticated connection, the app also creates a `worker_profiles` row for that user if it does not exist yet.
- These RLS policies now allow only authenticated users. Data is shared between all signed-in users of this project.
- Worker profiles are private per authenticated user; each user can only read and update their own profile.
- New appointments now persist `created_by`, `updated_by` and `updated_at` automatically from the authenticated Supabase user.
- The next security step, if you need stricter privacy, is multi-tenant access control by clinic or per-user ownership.

## Multi-tenant migration by clinic

Run this migration if you want data isolation by clinic:

```sql
create extension if not exists pgcrypto;

create table if not exists clinics (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  access_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_at timestamptz not null default now()
);

insert into clinics (nombre)
select 'Clinica principal'
where not exists (select 1 from clinics);

alter table worker_profiles
  add column if not exists clinic_id uuid;

alter table patients
  add column if not exists clinic_id uuid;

alter table appointments
  add column if not exists clinic_id uuid;

alter table task_templates
  add column if not exists clinic_id uuid;

alter table tasks
  add column if not exists clinic_id uuid;

with default_clinic as (
  select id from clinics order by created_at asc limit 1
)
update worker_profiles
set clinic_id = default_clinic.id
from default_clinic
where worker_profiles.clinic_id is null;

with default_clinic as (
  select id from clinics order by created_at asc limit 1
)
update patients
set clinic_id = default_clinic.id
from default_clinic
where patients.clinic_id is null;

with default_clinic as (
  select id from clinics order by created_at asc limit 1
)
update appointments
set clinic_id = default_clinic.id
from default_clinic
where appointments.clinic_id is null;

with default_clinic as (
  select id from clinics order by created_at asc limit 1
)
update task_templates
set clinic_id = default_clinic.id
from default_clinic
where task_templates.clinic_id is null;

with default_clinic as (
  select id from clinics order by created_at asc limit 1
)
update tasks
set clinic_id = default_clinic.id
from default_clinic
where tasks.clinic_id is null;

alter table worker_profiles
  alter column clinic_id set not null;

alter table patients
  alter column clinic_id set not null;

alter table appointments
  alter column clinic_id set not null;

alter table task_templates
  alter column clinic_id set not null;

alter table tasks
  alter column clinic_id set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'worker_profiles_clinic_id_fkey') then
    alter table worker_profiles
      add constraint worker_profiles_clinic_id_fkey
      foreign key (clinic_id) references clinics(id) on delete restrict;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'patients_clinic_id_fkey') then
    alter table patients
      add constraint patients_clinic_id_fkey
      foreign key (clinic_id) references clinics(id) on delete restrict;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'appointments_clinic_id_fkey') then
    alter table appointments
      add constraint appointments_clinic_id_fkey
      foreign key (clinic_id) references clinics(id) on delete restrict;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'task_templates_clinic_id_fkey') then
    alter table task_templates
      add constraint task_templates_clinic_id_fkey
      foreign key (clinic_id) references clinics(id) on delete restrict;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'tasks_clinic_id_fkey') then
    alter table tasks
      add constraint tasks_clinic_id_fkey
      foreign key (clinic_id) references clinics(id) on delete restrict;
  end if;
end $$;

create index if not exists idx_worker_profiles_clinic_id on worker_profiles (clinic_id);
create index if not exists idx_patients_clinic_id on patients (clinic_id);
create index if not exists idx_appointments_clinic_id on appointments (clinic_id);
create index if not exists idx_task_templates_clinic_id on task_templates (clinic_id);
create index if not exists idx_tasks_clinic_id on tasks (clinic_id);

create or replace function current_user_clinic_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select clinic_id
  from worker_profiles
  where id = auth.uid()
$$;

alter table clinics enable row level security;

drop policy if exists "read clinics for authenticated users" on clinics;
drop policy if exists "insert clinics for authenticated users" on clinics;
create policy "read clinics for authenticated users"
on clinics
for select
to authenticated
using (true);

create policy "insert clinics for authenticated users"
on clinics
for insert
to authenticated
with check (true);

drop policy if exists "authenticated full access patients" on patients;
drop policy if exists "authenticated full access appointments" on appointments;
drop policy if exists "authenticated full access task_templates" on task_templates;
drop policy if exists "authenticated full access tasks" on tasks;
drop policy if exists "read own worker profile" on worker_profiles;
drop policy if exists "insert own worker profile" on worker_profiles;
drop policy if exists "update own worker profile" on worker_profiles;

create policy "clinic scoped patients"
on patients
for all
to authenticated
using (clinic_id = current_user_clinic_id())
with check (clinic_id = current_user_clinic_id());

create policy "clinic scoped appointments"
on appointments
for all
to authenticated
using (clinic_id = current_user_clinic_id())
with check (clinic_id = current_user_clinic_id());

create policy "clinic scoped task templates"
on task_templates
for all
to authenticated
using (clinic_id = current_user_clinic_id())
with check (clinic_id = current_user_clinic_id());

create policy "clinic scoped tasks"
on tasks
for all
to authenticated
using (clinic_id = current_user_clinic_id())
with check (clinic_id = current_user_clinic_id());

create policy "read clinic worker profiles"
on worker_profiles
for select
to authenticated
using (clinic_id = current_user_clinic_id());

create policy "insert own worker profile in own clinic"
on worker_profiles
for insert
to authenticated
with check (auth.uid() = id and clinic_id is not null);

create policy "repair own worker profile clinic"
on worker_profiles
for update
to authenticated
using (auth.uid() = id and clinic_id is null)
with check (auth.uid() = id and clinic_id is not null);

create policy "update own worker profile in own clinic"
on worker_profiles
for update
to authenticated
using (auth.uid() = id and clinic_id = current_user_clinic_id())
with check (auth.uid() = id and clinic_id = current_user_clinic_id());
```

If a user was created before the multi-tenant migration and still has `worker_profiles.clinic_id` as `null`, run this repair once:

```sql
with default_clinic as (
  select id from clinics order by created_at asc limit 1
)
update worker_profiles
set clinic_id = default_clinic.id
from default_clinic
where worker_profiles.clinic_id is null;
```
