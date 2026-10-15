create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(btrim(full_name)) > 0),
  email text not null check (char_length(btrim(email)) > 0),
  phone text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(btrim(name)) > 0),
  description text not null,
  created_at timestamptz not null default now()
);

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete restrict,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'quoted', 'approved', 'rejected')),
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now()
);

create index customers_email_lower_idx on public.customers (lower(email));
create index quote_requests_customer_id_idx on public.quote_requests (customer_id);
create index quote_requests_status_idx on public.quote_requests (status);
create index quote_requests_created_at_idx on public.quote_requests (created_at desc);
create index quote_items_quote_request_id_idx on public.quote_items (quote_request_id);
create index quote_items_product_id_idx on public.quote_items (product_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create trigger quote_requests_set_updated_at
before update on public.quote_requests
for each row
execute function public.set_updated_at();

insert into public.products (id, name, description)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Architectural Shingles',
    'Premium weather-resistant asphalt shingles with a bold, dimensional look.'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Industrial Roof Sealant',
    'Waterproof protection for flashing, vents, and seams. Easy application.'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Synthetic Underlayment',
    'Lightweight, slip-resistant material for extra waterproofing under shingles.'
  );

alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_items enable row level security;

revoke all on table
  public.customers,
  public.products,
  public.quote_requests,
  public.quote_items
from public, anon, authenticated;

grant select on table public.products to anon, authenticated;

create policy "Anyone can read products"
on public.products
for select
to anon, authenticated
using (true);

create function public.submit_quote_request(
  p_full_name text,
  p_email text,
  p_phone text,
  p_items jsonb,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_product_id uuid;
  v_quantity numeric;
  v_customer_id uuid;
  v_quote_request_id uuid;
begin
  if p_full_name is null or pg_catalog.btrim(p_full_name) = '' then
    raise exception using errcode = '22023', message = 'Full name is required';
  end if;

  if p_email is null or pg_catalog.btrim(p_email) = '' then
    raise exception using errcode = '22023', message = 'Email is required';
  end if;

  if p_items is null or pg_catalog.jsonb_typeof(p_items) is distinct from 'array' then
    raise exception using errcode = '22023', message = 'Requested products must be an array';
  end if;

  if pg_catalog.jsonb_array_length(p_items) = 0 then
    raise exception using errcode = '22023', message = 'At least one product is required';
  end if;

  for v_item in
    select item.value
    from pg_catalog.jsonb_array_elements(p_items) as item(value)
  loop
    if pg_catalog.jsonb_typeof(v_item) is distinct from 'object' then
      raise exception using errcode = '22023', message = 'Each requested product must be an object';
    end if;

    if pg_catalog.jsonb_typeof(v_item -> 'product_id') is distinct from 'string' then
      raise exception using errcode = '22023', message = 'Each requested product must include a product_id';
    end if;

    if pg_catalog.jsonb_typeof(v_item -> 'quantity') is distinct from 'number' then
      raise exception using errcode = '22023', message = 'Each requested product must include a numeric quantity';
    end if;

    begin
      v_product_id := (v_item ->> 'product_id')::uuid;
      v_quantity := (v_item ->> 'quantity')::numeric;
    exception
      when invalid_text_representation or numeric_value_out_of_range then
        raise exception using errcode = '22023', message = 'Product ID or quantity is invalid';
    end;

    if v_quantity <= 0 or v_quantity <> pg_catalog.trunc(v_quantity) or v_quantity > 2147483647 then
      raise exception using errcode = '22023', message = 'Quantity must be a positive integer';
    end if;

    if not exists (
      select 1
      from public.products as product
      where product.id = v_product_id
    ) then
      raise exception using errcode = '22023', message = 'A requested product does not exist';
    end if;
  end loop;

  insert into public.customers (full_name, email, phone)
  values (pg_catalog.btrim(p_full_name), pg_catalog.btrim(p_email), p_phone)
  returning id into v_customer_id;

  insert into public.quote_requests (customer_id, status, message)
  values (v_customer_id, 'new', p_message)
  returning id into v_quote_request_id;

  for v_item in
    select item.value
    from pg_catalog.jsonb_array_elements(p_items) as item(value)
  loop
    insert into public.quote_items (quote_request_id, product_id, quantity)
    values (
      v_quote_request_id,
      (v_item ->> 'product_id')::uuid,
      (v_item ->> 'quantity')::integer
    );
  end loop;

  return v_quote_request_id;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.submit_quote_request(text, text, text, jsonb, text)
  from public, anon, authenticated;
grant execute on function public.submit_quote_request(text, text, text, jsonb, text) to anon;