create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from public, anon, authenticated;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users as admin
    where admin.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

grant select on table public.customers, public.quote_requests, public.quote_items to authenticated;
grant update (status) on table public.quote_requests to authenticated;

create policy "Admins can read customers"
on public.customers
for select
to authenticated
using (public.is_admin());

create policy "Admins can read quote requests"
on public.quote_requests
for select
to authenticated
using (public.is_admin());

create policy "Admins can update quote status"
on public.quote_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can read quote items"
on public.quote_items
for select
to authenticated
using (public.is_admin());