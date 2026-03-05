-- Profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Videos
alter table public.videos enable row level security;
create policy "Free videos are public" on public.videos for select
  using (published_at is not null and is_premium = false);
create policy "Premium videos require subscription" on public.videos for select
  using (
    published_at is not null and is_premium = true and
    exists (
      select 1 from public.subscriptions
      where user_id = auth.uid() and status = 'active'
    )
  );

-- Recipes
alter table public.recipes enable row level security;
create policy "Free recipes are public" on public.recipes for select
  using (published_at is not null and is_premium = false);
create policy "Premium recipes require subscription" on public.recipes for select
  using (
    published_at is not null and is_premium = true and
    exists (select 1 from public.subscriptions where user_id = auth.uid() and status = 'active')
  );

-- Posts
alter table public.posts enable row level security;
create policy "Published posts are public" on public.posts for select
  using (published_at is not null);

-- Collections
alter table public.collections enable row level security;
create policy "Free collections are public" on public.collections for select
  using (is_premium = false);
create policy "Premium collections require subscription" on public.collections for select
  using (
    is_premium = true and
    exists (select 1 from public.subscriptions where user_id = auth.uid() and status = 'active')
  );

-- Collection items
alter table public.collection_items enable row level security;
create policy "Collection items are public" on public.collection_items for select using (true);

-- Ingredients, steps, nutrition (follow recipe access — public read for simplicity, RLS on recipes handles premium)
alter table public.ingredients enable row level security;
create policy "Ingredients are public" on public.ingredients for select using (true);

alter table public.recipe_steps enable row level security;
create policy "Steps are public" on public.recipe_steps for select using (true);

alter table public.nutrition enable row level security;
create policy "Nutrition is public" on public.nutrition for select using (true);

-- Instructors
alter table public.instructors enable row level security;
create policy "Instructors are public" on public.instructors for select using (true);

-- Subscriptions
alter table public.subscriptions enable row level security;
create policy "Users view own subscription" on public.subscriptions for select using (auth.uid() = user_id);

-- Playlists
alter table public.playlists enable row level security;
create policy "Users manage own playlists" on public.playlists for all using (auth.uid() = user_id);
create policy "Public playlists are viewable" on public.playlists for select using (is_public = true);

-- Playlist items
alter table public.playlist_items enable row level security;
create policy "Playlist items follow playlist ownership" on public.playlist_items for all
  using (exists (select 1 from public.playlists where id = playlist_id and user_id = auth.uid()));

-- Bookmarks
alter table public.bookmarks enable row level security;
create policy "Users manage own bookmarks" on public.bookmarks for all using (auth.uid() = user_id);

-- Social links
alter table public.social_links enable row level security;
create policy "Social links are public" on public.social_links for select using (is_active = true);

-- Newsletter
alter table public.newsletter_subs enable row level security;
create policy "Anyone can subscribe" on public.newsletter_subs for insert with check (true);
create policy "Service role manages newsletter" on public.newsletter_subs for all using (auth.role() = 'service_role');

-- Embeddings
alter table public.content_embeddings enable row level security;
create policy "Embeddings are public" on public.content_embeddings for select using (true);
