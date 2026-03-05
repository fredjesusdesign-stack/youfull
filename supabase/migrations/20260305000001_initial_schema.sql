-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- Instructors
create table public.instructors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  bio text,
  avatar_url text,
  instagram_url text,
  created_at timestamptz default now()
);

-- Videos
create table public.videos (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  thumbnail_url text,
  youtube_url text,
  vimeo_url text,
  duration_minutes int,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  category text,
  tags text[] default '{}',
  is_premium boolean default false,
  instructor_id uuid references public.instructors(id),
  published_at timestamptz,
  created_at timestamptz default now()
);

-- Recipes
create table public.recipes (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  thumbnail_url text,
  video_url text,
  prep_time int,
  cook_time int,
  servings int,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  category text,
  tags text[] default '{}',
  is_premium boolean default false,
  instructor_id uuid references public.instructors(id),
  published_at timestamptz,
  created_at timestamptz default now()
);

create table public.ingredients (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid references public.recipes(id) on delete cascade,
  name text not null,
  quantity text,
  unit text,
  sort_order int default 0
);

create table public.recipe_steps (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid references public.recipes(id) on delete cascade,
  step_number int not null,
  description text not null,
  image_url text
);

create table public.nutrition (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid unique references public.recipes(id) on delete cascade,
  calories int,
  protein_g numeric(5,1),
  carbs_g numeric(5,1),
  fat_g numeric(5,1),
  fiber_g numeric(5,1)
);

-- Blog posts
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  content jsonb,
  thumbnail_url text,
  video_url text,
  category text,
  tags text[] default '{}',
  published_at timestamptz,
  created_at timestamptz default now()
);

-- Collections (admin-curated)
create table public.collections (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  thumbnail_url text,
  is_premium boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table public.collection_items (
  id uuid primary key default uuid_generate_v4(),
  collection_id uuid references public.collections(id) on delete cascade,
  content_type text check (content_type in ('video', 'recipe', 'post')),
  content_id uuid not null,
  sort_order int default 0
);

-- User profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text default 'free' check (role in ('free', 'premium', 'admin')),
  created_at timestamptz default now()
);

-- Subscriptions
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text check (status in ('active', 'canceled', 'past_due', 'trialing')),
  plan text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User playlists
create table public.playlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  is_public boolean default false,
  created_at timestamptz default now()
);

create table public.playlist_items (
  id uuid primary key default uuid_generate_v4(),
  playlist_id uuid references public.playlists(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  sort_order int default 0,
  added_at timestamptz default now(),
  unique(playlist_id, video_id)
);

-- Bookmarks
create table public.bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  content_type text check (content_type in ('video', 'recipe', 'post')),
  content_id uuid not null,
  created_at timestamptz default now(),
  unique(user_id, content_type, content_id)
);

-- Social links
create table public.social_links (
  id uuid primary key default uuid_generate_v4(),
  platform text not null,
  url text not null,
  is_active boolean default true
);

-- Newsletter
create table public.newsletter_subs (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  confirmed boolean default false,
  subscribed_at timestamptz default now()
);

-- AI Search embeddings
create table public.content_embeddings (
  id uuid primary key default uuid_generate_v4(),
  content_type text check (content_type in ('video', 'recipe', 'post')),
  content_id uuid not null,
  embedding vector(1536),
  created_at timestamptz default now(),
  unique(content_type, content_id)
);
create index on public.content_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
