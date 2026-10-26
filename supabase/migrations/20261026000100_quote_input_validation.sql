-- Repeat the form's checks in the database so direct RPC calls can't skip them.
create or replace function public.submit_quote_request(
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
  -- A visitor can call the RPC without using the form, so check the contact fields here too.
  if p_full_name is null or pg_catalog.btrim(p_full_name) = '' then
    raise exception using errcode = '22023', message = 'Full name is required';
  end if;

  if pg_catalog.char_length(p_full_name) > 200 then
    raise exception using errcode = '22023', message = 'Full name must be 200 characters or fewer';
  end if;

  if p_email is null or pg_catalog.btrim(p_email) = '' then
    raise exception using errcode = '22023', message = 'Email is required';
  end if;

  if pg_catalog.char_length(p_email) > 254
    or pg_catalog.btrim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  then
    raise exception using errcode = '22023', message = 'Email address is invalid';
  end if;

  if p_phone is not null and pg_catalog.char_length(p_phone) > 40 then
    raise exception using errcode = '22023', message = 'Phone number must be 40 characters or fewer';
  end if;

  if p_message is not null and pg_catalog.char_length(p_message) > 5000 then
    raise exception using errcode = '22023', message = 'Message must be 5000 characters or fewer';
  end if;

  -- Reject missing or malformed product lists before reading or saving any quote rows.
  if p_items is null or pg_catalog.jsonb_typeof(p_items) is distinct from 'array' then
    raise exception using errcode = '22023', message = 'Requested products must be an array';
  end if;

  if pg_catalog.jsonb_array_length(p_items) = 0 then
    raise exception using errcode = '22023', message = 'At least one product is required';
  end if;

  -- Validate every product ID and quantity before inserting the customer or quote.
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

  -- All input is checked now, so save the customer, request, and item rows together.
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

-- Keep the same caller permissions as before: public visitors can submit, not manage data.
revoke all on function public.submit_quote_request(text, text, text, jsonb, text)
  from public, anon, authenticated;
grant execute on function public.submit_quote_request(text, text, text, jsonb, text) to anon;
