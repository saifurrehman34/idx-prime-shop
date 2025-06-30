
-- Drop existing tables
drop table if exists "public"."addresses" cascade;
drop table if exists "public"."blog_posts" cascade;
drop table if exists "public"."brands" cascade;
drop table if exists "public"."categories" cascade;
drop table if exists "public"."hero_slides" cascade;
drop table if exists "public"."newsletter_subscribers" cascade;
drop table if exists "public"."notifications" cascade;
drop table if exists "public"."offers" cascade;
drop table if exists "public"."order_items" cascade;
drop table if exists "public"."orders" cascade;
drop table if exists "public"."products" cascade;
drop table if exists "public"."reviews" cascade;
drop table if exists "public"."testimonials" cascade;
drop table if exists "public"."user_profiles" cascade;
drop table if exists "public"."wishlists" cascade;

-- Drop existing types and functions
drop type if exists "public"."order_status" cascade;
drop function if exists "public"."execute_sql" cascade;
drop function if exists "public"."get_admin_stats" cascade;
drop function if exists "public"."get_user_order_stats" cascade;
drop function if exists "public"."get_revenue_over_time" cascade;

-- Create ENUM for order_status
create type "public"."order_status" as enum ('pending', 'shipped', 'delivered', 'cancelled');

-- Create tables
create table "public"."addresses" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "address_line_1" text not null,
    "address_line_2" text,
    "city" text not null,
    "state" text not null,
    "postal_code" text not null,
    "country" text not null default 'USA'::text,
    "is_default" boolean not null default false
);

create table "public"."blog_posts" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "title" text not null,
    "content" text not null,
    "image_url" text not null
);

create table "public"."brands" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "image_url" text not null
);

create table "public"."categories" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "image_url" text not null,
    "data_ai_hint" text not null
);

create table "public"."hero_slides" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "title" text not null,
    "subtitle" text,
    "image_url" text not null,
    "image_ai_hint" text,
    "link" text,
    "is_active" boolean not null default true
);


create table "public"."newsletter_subscribers" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "email" text not null
);

create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "message" text not null,
    "link" text,
    "is_read" boolean not null default false
);

create table "public"."offers" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "title" text not null,
    "description" text not null,
    "image_url" text not null
);

create table "public"."order_items" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid not null,
    "product_id" uuid not null,
    "quantity" integer not null,
    "price" numeric not null
);

create table "public"."orders" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "total_amount" numeric not null,
    "status" order_status not null default 'pending'::order_status,
    "shipping_address_id" uuid,
    "payment_method" text not null
);

create table "public"."products" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "description" text not null,
    "price" numeric not null,
    "image_url" text not null,
    "category_id" uuid,
    "is_featured" boolean not null default false,
    "is_best_seller" boolean not null default false,
    "long_description" text not null,
    "data_ai_hint" text not null
);

create table "public"."reviews" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "product_id" uuid not null,
    "rating" integer not null,
    "comment" text,
    constraint "reviews_rating_check" check (((rating >= 1) and (rating <= 5)))
);

create table "public"."testimonials" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "quote" text not null,
    "image_url" text not null,
    "rating" integer not null,
    constraint "testimonials_rating_check" check (((rating >= 1) and (rating <= 5)))
);

create table "public"."user_profiles" (
    "id" uuid not null,
    "full_name" text,
    "avatar_url" text,
    "role" text not null default 'user'::text
);

create table "public"."wishlists" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "product_id" uuid not null
);

-- Primary Keys
alter table "public"."addresses" add constraint "addresses_pkey" primary key using index ("id");
alter table "public"."blog_posts" add constraint "blog_posts_pkey" primary key using index ("id");
alter table "public"."brands" add constraint "brands_pkey" primary key using index ("id");
alter table "public"."categories" add constraint "categories_pkey" primary key using index ("id");
alter table "public"."hero_slides" add constraint "hero_slides_pkey" primary key using index ("id");
alter table "public"."newsletter_subscribers" add constraint "newsletter_subscribers_pkey" primary key using index ("id");
alter table "public"."notifications" add constraint "notifications_pkey" primary key using index ("id");
alter table "public"."offers" add constraint "offers_pkey" primary key using index ("id");
alter table "public"."order_items" add constraint "order_items_pkey" primary key using index ("id");
alter table "public"."orders" add constraint "orders_pkey" primary key using index ("id");
alter table "public"."products" add constraint "products_pkey" primary key using index ("id");
alter table "public"."reviews" add constraint "reviews_pkey" primary key using index ("id");
alter table "public"."testimonials" add constraint "testimonials_pkey" primary key using index ("id");
alter table "public"."user_profiles" add constraint "user_profiles_pkey" primary key using index ("id");
alter table "public"."wishlists" add constraint "wishlists_pkey" primary key using index ("id");

-- Unique constraints
alter table "public"."newsletter_subscribers" add constraint "newsletter_subscribers_email_key" unique using index ("email");
alter table "public"."reviews" add constraint "reviews_user_id_product_id_key" unique using index ("user_id", "product_id");
alter table "public"."wishlists" add constraint "wishlists_user_id_product_id_key" unique using index ("user_id", "product_id");


-- Foreign Keys
alter table "public"."addresses" add constraint "addresses_user_id_fkey" foreign key (user_id) references auth.users(id) on delete cascade;
alter table "public"."notifications" add constraint "notifications_user_id_fkey" foreign key (user_id) references auth.users(id) on delete cascade;
alter table "public"."order_items" add constraint "order_items_order_id_fkey" foreign key (order_id) references orders(id) on delete cascade;
alter table "public"."order_items" add constraint "order_items_product_id_fkey" foreign key (product_id) references products(id) on delete cascade;
alter table "public"."orders" add constraint "orders_shipping_address_id_fkey" foreign key (shipping_address_id) references addresses(id) on delete set null;
alter table "public"."orders" add constraint "orders_user_id_fkey" foreign key (user_id) references auth.users(id) on delete cascade;
alter table "public"."products" add constraint "products_category_id_fkey" foreign key (category_id) references categories(id) on delete set null;
alter table "public"."reviews" add constraint "reviews_product_id_fkey" foreign key (product_id) references products(id) on delete cascade;
alter table "public"."reviews" add constraint "reviews_user_id_fkey" foreign key (user_id) references auth.users(id) on delete cascade;
alter table "public"."user_profiles" add constraint "user_profiles_id_fkey" foreign key (id) references auth.users(id) on delete cascade;
alter table "public"."wishlists" add constraint "wishlists_product_id_fkey" foreign key (product_id) references products(id) on delete cascade;
alter table "public"."wishlists" add constraint "wishlists_user_id_fkey" foreign key (user_id) references auth.users(id) on delete cascade;

-- RLS Policies
alter table "public"."addresses" enable row level security;
create policy "Allow all access to own addresses" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table "public"."orders" enable row level security;
create policy "Allow read access to own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Allow insert access to own orders" on public.orders for insert with check (auth.uid() = user_id);

alter table "public"."order_items" enable row level security;
create policy "Allow read access to own order items" on public.order_items for select using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

alter table "public"."reviews" enable row level security;
create policy "Allow read access for all" on public.reviews for select using (true);
create policy "Allow insert access to own reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Allow update access to own reviews" on public.reviews for update using (auth.uid() = user_id);

alter table "public"."user_profiles" enable row level security;
create policy "Allow read access to own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "Allow update access to own profile" on public.user_profiles for update using (auth.uid() = id);

alter table "public"."wishlists" enable row level security;
create policy "Allow all access to own wishlist" on public.wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table "public"."products" enable row level security;
create policy "Allow read access for all" on public.products for select using (true);

alter table "public"."categories" enable row level security;
create policy "Allow read access for all" on public.categories for select using (true);

alter table "public"."hero_slides" enable row level security;
create policy "Allow read access for all" on public.hero_slides for select using (true);

-- Functions
create or replace function public.execute_sql(sql_query text)
returns json
language plpgsql
security definer
as $$
begin
    execute sql_query;
    return '{"status": "success"}'::json;
end;
$$;

create or replace function get_admin_stats()
returns table (
    total_revenue numeric,
    total_orders bigint,
    total_products bigint,
    total_users bigint,
    pending_orders bigint,
    total_subscribers bigint
)
language plpgsql
security definer
as $$
begin
    return query
    select
        (select coalesce(sum(total_amount), 0) from public.orders where status = 'delivered') as total_revenue,
        (select count(*) from public.orders) as total_orders,
        (select count(*) from public.products) as total_products,
        (select count(*) from auth.users) as total_users,
        (select count(*) from public.orders where status = 'pending') as pending_orders,
        (select count(*) from public.newsletter_subscribers) as total_subscribers;
end;
$$;

create or replace function get_revenue_over_time()
returns table(month text, total_revenue numeric) as $$
begin
  return query
  with months as (
    select to_char(date_trunc('month', (current_date - (n || ' month')::interval)), 'YYYY-MM') as month
    from generate_series(0, 11) n
  )
  select
    to_char(months.month::date, 'Mon') as month,
    coalesce(sum(o.total_amount), 0) as total_revenue
  from months
  left join public.orders o
    on to_char(o.created_at, 'YYYY-MM') = months.month
    and o.status = 'delivered'
  group by months.month
  order by months.month asc;
end;
$$ language plpgsql security definer;


create or replace function get_user_order_stats(p_user_id uuid)
returns table (
    total_spent numeric,
    total_orders bigint,
    pending_orders bigint
)
language plpgsql
security definer
as $$
begin
    return query
    select
        coalesce(sum(case when status = 'delivered' then total_amount else 0 end), 0) as total_spent,
        count(*) as total_orders,
        count(case when status = 'pending' then 1 else null end) as pending_orders
    from public.orders
    where user_id = p_user_id;
end;
$$;


create or replace function public.user_has_purchased_product(p_user_id uuid, p_product_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.orders o
    join public.order_items oi on o.id = oi.order_id
    where o.user_id = p_user_id
      and oi.product_id = p_product_id
      and o.status = 'delivered'
  );
end;
$$;
