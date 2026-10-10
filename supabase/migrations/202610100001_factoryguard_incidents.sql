create table if not exists public.factoryguard_incidents (
  id text primary key,
  machine_id text not null,
  severity text not null check (severity in ('normal', 'warning', 'critical')),
  probable_cause text,
  recommended_action text not null,
  requires_human_approval boolean not null default false,
  status text not null check (status in ('detected', 'investigating', 'recommended', 'awaiting_approval', 'approved', 'rejected', 'maintenance', 'recovered', 'closed')),
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  approved_by text,
  rejected_by text,
  rejection_reason text
);

create index if not exists factoryguard_incidents_machine_created_idx
  on public.factoryguard_incidents (machine_id, created_at desc);

create index if not exists factoryguard_incidents_status_idx
  on public.factoryguard_incidents (status);

alter table public.factoryguard_incidents enable row level security;

-- This table is accessed only by server-side API routes using SUPABASE_SERVICE_ROLE_KEY.
-- Never expose the service-role key to browser/client code.
