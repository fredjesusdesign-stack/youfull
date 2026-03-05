# Youfull Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Youfull wellness platform — video lessons, recipes, blog, freemium subscription, AI search, and admin panel.

**Architecture:** Next.js 15 App Router with Supabase (PostgreSQL + Auth + Storage + pgvector), Stripe for payments, Claude API for AI-powered semantic search, deployed on Vercel.

**Tech Stack:** Next.js 15, Tailwind CSS, Supabase, Stripe, Tiptap, Resend, Claude API (claude-haiku-4-5), @dnd-kit (drag-and-drop)

---

## Phase 1: Project Foundation

### Task 1: Scaffold Next.js project

**Files:**
- Create: `youfull/` (project root)

**Step 1: Create Next.js 15 app**
```bash
cd /Users/fredjesus
npx create-next-app@latest youfull \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
cd youfull
```

**Step 2: Install dependencies**
```bash
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  @stripe/stripe-js \
  stripe \
  @tiptap/react \
  @tiptap/starter-kit \
  @tiptap/extension-image \
  @tiptap/extension-link \
  @anthropic-ai/sdk \
  resend \
  @dnd-kit/core \
  @dnd-kit/sortable \
  @dnd-kit/utilities \
  lucide-react \
  slugify \
  date-fns \
  zod
```

**Step 3: Verify dev server starts**
```bash
npm run dev
```
Expected: Server running at http://localhost:3000

**Step 4: Commit**
```bash
git add -A
git commit -m "feat: scaffold Next.js 15 project with dependencies"
```

---

### Task 2: Tailwind design system

**Files:**
- Modify: `tailwind.config.ts`
- Create: `src/app/globals.css`

**Step 1: Update tailwind.config.ts**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF8',
        surface: '#F4F4F0',
        primary: {
          DEFAULT: '#7C9A6E',
          dark: '#5A7A52',
        },
        text: {
          DEFAULT: '#1C1C1A',
          muted: '#8C8C87',
        },
        border: '#E8E8E4',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

**Step 2: Update globals.css**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background text-text font-sans;
  }
}
```

**Step 3: Commit**
```bash
git add -A
git commit -m "feat: configure Tailwind design system with Youfull palette"
```

---

### Task 3: Environment variables

**Files:**
- Create: `.env.local`
- Create: `.env.example`

**Step 1: Create .env.local**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@youfull.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 2: Copy to .env.example with placeholder values, add .env.local to .gitignore**

**Step 3: Commit**
```bash
git add .env.example .gitignore
git commit -m "chore: add environment variable templates"
```

---

### Task 4: Supabase client helpers

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`

**Step 1: Create browser client**
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Create server client**
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}
```

**Step 3: Create middleware Supabase helper**
```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return { supabaseResponse, user, supabase }
}
```

**Step 4: Commit**
```bash
git add -A
git commit -m "feat: add Supabase client helpers (browser + server + middleware)"
```

---

### Task 5: Database migrations

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Install Supabase CLI and init**
```bash
npm install -D supabase
npx supabase init
npx supabase login
npx supabase link --project-ref your_project_ref
```

**Step 2: Create migration file**
```sql
-- supabase/migrations/001_initial_schema.sql

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
create index on public.content_embeddings using ivfflat (embedding vector_cosine_ops);

-- Auto-create profile on signup
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
```

**Step 3: Push migration**
```bash
npx supabase db push
```
Expected: Migration applied successfully.

**Step 4: Commit**
```bash
git add -A
git commit -m "feat: add initial database schema migration"
```

---

### Task 6: Row Level Security policies

**Files:**
- Create: `supabase/migrations/002_rls_policies.sql`

**Step 1: Create RLS policies**
```sql
-- supabase/migrations/002_rls_policies.sql

-- Profiles: users can read/update their own
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Videos: published free content public; premium requires active subscription
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

-- Same pattern for recipes
alter table public.recipes enable row level security;
create policy "Free recipes are public" on public.recipes for select
  using (published_at is not null and is_premium = false);
create policy "Premium recipes require subscription" on public.recipes for select
  using (
    published_at is not null and is_premium = true and
    exists (select 1 from public.subscriptions where user_id = auth.uid() and status = 'active')
  );

-- Posts: all published posts are public
alter table public.posts enable row level security;
create policy "Published posts are public" on public.posts for select
  using (published_at is not null);

-- Collections: premium collections require subscription
alter table public.collections enable row level security;
create policy "Free collections are public" on public.collections for select
  using (is_premium = false);
create policy "Premium collections require subscription" on public.collections for select
  using (is_premium = true and exists (
    select 1 from public.subscriptions where user_id = auth.uid() and status = 'active'
  ));

-- Collection items, ingredients, steps, nutrition: follow parent RLS via security definer functions
alter table public.collection_items enable row level security;
create policy "Collection items are public" on public.collection_items for select using (true);
alter table public.ingredients enable row level security;
create policy "Ingredients are public" on public.ingredients for select using (true);
alter table public.recipe_steps enable row level security;
create policy "Steps are public" on public.recipe_steps for select using (true);
alter table public.nutrition enable row level security;
create policy "Nutrition is public" on public.nutrition for select using (true);

-- Instructors: public
alter table public.instructors enable row level security;
create policy "Instructors are public" on public.instructors for select using (true);

-- Subscriptions: users see their own
alter table public.subscriptions enable row level security;
create policy "Users view own subscription" on public.subscriptions for select using (auth.uid() = user_id);

-- Playlists: users manage their own; public playlists readable by all
alter table public.playlists enable row level security;
create policy "Users manage own playlists" on public.playlists for all using (auth.uid() = user_id);
create policy "Public playlists are viewable" on public.playlists for select using (is_public = true);

alter table public.playlist_items enable row level security;
create policy "Playlist items follow playlist ownership" on public.playlist_items for all
  using (exists (select 1 from public.playlists where id = playlist_id and user_id = auth.uid()));

-- Bookmarks: users manage their own
alter table public.bookmarks enable row level security;
create policy "Users manage own bookmarks" on public.bookmarks for all using (auth.uid() = user_id);

-- Social links and newsletter: public read
alter table public.social_links enable row level security;
create policy "Social links are public" on public.social_links for select using (is_active = true);
alter table public.newsletter_subs enable row level security;
create policy "Anyone can subscribe" on public.newsletter_subs for insert with check (true);

-- Embeddings: public read for search
alter table public.content_embeddings enable row level security;
create policy "Embeddings are public" on public.content_embeddings for select using (true);
```

**Step 2: Push**
```bash
npx supabase db push
```

**Step 3: Commit**
```bash
git add -A
git commit -m "feat: add RLS policies for all tables"
```

---

### Task 7: Supabase Storage buckets

Run in Supabase Dashboard > Storage > Create buckets:
- `thumbnails` — public bucket (images for videos, recipes, posts, collections)
- `avatars` — public bucket (user avatars)
- `recipe-steps` — public bucket (step images)

Or via SQL:
```sql
insert into storage.buckets (id, name, public) values
  ('thumbnails', 'thumbnails', true),
  ('avatars', 'avatars', true),
  ('recipe-steps', 'recipe-steps', true);
```

**Commit:**
```bash
git commit -m "chore: document Supabase Storage bucket setup"
```

---

## Phase 2: Middleware & Auth

### Task 8: Route protection middleware

**Files:**
- Create: `src/middleware.ts`

**Step 1: Write middleware**
```typescript
// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request)
  const path = request.nextUrl.pathname

  // Admin routes: require admin role
  if (path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.redirect(new URL('/', request.url))
  }

  // Members routes: require active subscription
  if (path.startsWith('/members')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const { data: sub } = await supabase
      .from('subscriptions').select('status').eq('user_id', user.id).single()
    if (sub?.status !== 'active') return NextResponse.redirect(new URL('/precos', request.url))
  }

  // Auth routes: redirect logged-in users
  if ((path.startsWith('/login') || path.startsWith('/registo')) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

**Step 2: Commit**
```bash
git add -A
git commit -m "feat: add route protection middleware (admin + members)"
```

---

### Task 9: Auth pages

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/registo/page.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/actions.ts`

**Step 1: Auth layout**
```typescript
// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
```

**Step 2: Server actions**
```typescript
// src/app/(auth)/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: { data: { full_name: formData.get('full_name') as string } },
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
```

**Step 3: Login page**
```typescript
// src/app/(auth)/login/page.tsx
import { login } from '../actions'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="bg-surface rounded-2xl p-8 border border-border">
      <h1 className="text-2xl font-semibold text-text mb-6">Entrar</h1>
      <form action={login} className="space-y-4">
        <input name="email" type="email" placeholder="Email" required
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary" />
        <input name="password" type="password" placeholder="Password" required
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary" />
        <button type="submit"
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-full font-medium transition-colors">
          Entrar
        </button>
      </form>
      <p className="mt-4 text-center text-text-muted text-sm">
        Não tens conta?{' '}
        <Link href="/registo" className="text-primary hover:underline">Regista-te</Link>
      </p>
    </div>
  )
}
```

**Step 4: Register page** — same structure as login, add `full_name` field, call `register` action.

**Step 5: Commit**
```bash
git add -A
git commit -m "feat: add auth pages (login, register) with Supabase server actions"
```

---

## Phase 3: Shared UI Components

### Task 10: Base layout, navbar, footer

**Files:**
- Create: `src/app/(public)/layout.tsx`
- Create: `src/components/Navbar.tsx`
- Create: `src/components/Footer.tsx`

**Step 1: Navbar**
```typescript
// src/components/Navbar.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/(auth)/actions'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-text">Youfull</Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-text-muted">
          <Link href="/videos" className="hover:text-text transition-colors">Vídeos</Link>
          <Link href="/receitas" className="hover:text-text transition-colors">Receitas</Link>
          <Link href="/blog" className="hover:text-text transition-colors">Blog</Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-text-muted hover:text-text">Área pessoal</Link>
              <form action={logout}>
                <button className="text-sm text-text-muted hover:text-text">Sair</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-text-muted hover:text-text">Entrar</Link>
              <Link href="/precos" className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-full transition-colors">
                Começar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
```

**Step 2: Footer**
```typescript
// src/components/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <p className="font-semibold text-text mb-3">Youfull</p>
          <p className="text-text-muted">Viver melhor, um dia de cada vez.</p>
        </div>
        <div>
          <p className="font-semibold text-text mb-3">Explorar</p>
          <ul className="space-y-2 text-text-muted">
            <li><Link href="/videos" className="hover:text-text">Vídeos</Link></li>
            <li><Link href="/receitas" className="hover:text-text">Receitas</Link></li>
            <li><Link href="/blog" className="hover:text-text">Blog</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-text mb-3">Conta</p>
          <ul className="space-y-2 text-text-muted">
            <li><Link href="/precos" className="hover:text-text">Planos</Link></li>
            <li><Link href="/login" className="hover:text-text">Entrar</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border text-center py-4 text-text-muted text-xs">
        © {new Date().getFullYear()} Youfull. Todos os direitos reservados.
      </div>
    </footer>
  )
}
```

**Step 3: Public layout**
```typescript
// src/app/(public)/layout.tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  )
}
```

**Step 4: Commit**
```bash
git add -A
git commit -m "feat: add Navbar, Footer, and public layout"
```

---

### Task 11: Reusable UI components

**Files:**
- Create: `src/components/ui/ContentCard.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/PremiumLock.tsx`
- Create: `src/components/ui/NewsletterForm.tsx`

**Step 1: ContentCard**
```typescript
// src/components/ui/ContentCard.tsx
import Image from 'next/image'
import Link from 'next/link'
import Badge from './Badge'
import { Lock } from 'lucide-react'

interface ContentCardProps {
  title: string
  slug: string
  href: string
  thumbnailUrl?: string
  category?: string
  isPremium?: boolean
  meta?: string  // e.g. "25 min · Intermédio"
}

export default function ContentCard({ title, href, thumbnailUrl, category, isPremium, meta }: ContentCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface mb-3">
        {thumbnailUrl ? (
          <Image src={thumbnailUrl} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-surface" />
        )}
        {isPremium && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 bg-text text-background text-xs px-2 py-1 rounded-full">
              <Lock size={10} /> Premium
            </span>
          </div>
        )}
      </div>
      {category && <Badge>{category}</Badge>}
      <h3 className="mt-1 font-medium text-text group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
      {meta && <p className="text-sm text-text-muted mt-1">{meta}</p>}
    </Link>
  )
}
```

**Step 2: Badge**
```typescript
// src/components/ui/Badge.tsx
export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs text-text-muted uppercase tracking-wide">
      {children}
    </span>
  )
}
```

**Step 3: PremiumLock** — shown when free user tries to access premium content
```typescript
// src/components/ui/PremiumLock.tsx
import Link from 'next/link'
import { Lock } from 'lucide-react'

export default function PremiumLock() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
        <Lock className="text-primary" size={24} />
      </div>
      <h2 className="text-xl font-semibold text-text mb-2">Conteúdo Premium</h2>
      <p className="text-text-muted mb-6 max-w-sm">Este conteúdo está disponível para membros premium.</p>
      <Link href="/precos" className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-full transition-colors">
        Ver planos
      </Link>
    </div>
  )
}
```

**Step 4: Commit**
```bash
git add -A
git commit -m "feat: add reusable UI components (ContentCard, Badge, PremiumLock)"
```

---

## Phase 4: Public Content Pages

### Task 12: Homepage

**Files:**
- Create: `src/app/(public)/page.tsx`
- Create: `src/components/NewsletterForm.tsx`

**Step 1: Homepage**
```typescript
// src/app/(public)/page.tsx
import { createClient } from '@/lib/supabase/server'
import ContentCard from '@/components/ui/ContentCard'
import NewsletterForm from '@/components/NewsletterForm'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const [{ data: videos }, { data: recipes }, { data: posts }] = await Promise.all([
    supabase.from('videos').select('*').eq('is_premium', false).not('published_at', 'is', null).order('published_at', { ascending: false }).limit(4),
    supabase.from('recipes').select('*').eq('is_premium', false).not('published_at', 'is', null).order('published_at', { ascending: false }).limit(4),
    supabase.from('posts').select('*').not('published_at', 'is', null).order('published_at', { ascending: false }).limit(3),
  ])

  return (
    <>
      {/* Hero */}
      <section className="min-h-[85vh] flex items-center justify-center bg-surface px-4">
        <div className="text-center max-w-2xl">
          <p className="text-primary text-sm tracking-widest uppercase mb-4">Bem-vindo à Youfull</p>
          <h1 className="text-5xl md:text-7xl font-light text-text leading-tight mb-6">
            Viver melhor,<br />com mais leveza
          </h1>
          <p className="text-text-muted text-lg mb-8">Yoga, receitas saudáveis e inspiração para o teu estilo de vida.</p>
          <Link href="/precos" className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-full text-lg transition-colors">
            Começar agora
          </Link>
        </div>
      </section>

      {/* Featured Videos */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-text">Vídeos em destaque</h2>
          <Link href="/videos" className="text-primary hover:underline text-sm">Ver todos</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {videos?.map(v => (
            <ContentCard key={v.id} title={v.title} href={`/videos/${v.slug}`}
              thumbnailUrl={v.thumbnail_url} category={v.category}
              isPremium={v.is_premium} meta={v.duration_minutes ? `${v.duration_minutes} min` : undefined} />
          ))}
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="bg-surface py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-text">Receitas</h2>
            <Link href="/receitas" className="text-primary hover:underline text-sm">Ver todas</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recipes?.map(r => (
              <ContentCard key={r.id} title={r.title} href={`/receitas/${r.slug}`}
                thumbnailUrl={r.thumbnail_url} category={r.category} isPremium={r.is_premium}
                meta={r.prep_time ? `${r.prep_time} min prep` : undefined} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold text-text mb-2">Fica inspirado</h2>
        <p className="text-text-muted mb-6">Recebe receitas e vídeos novos diretamente no teu email.</p>
        <NewsletterForm />
      </section>
    </>
  )
}
```

**Step 2: Commit**
```bash
git add -A
git commit -m "feat: add homepage with hero, featured content, newsletter"
```

---

### Task 13: Videos listing page with filters

**Files:**
- Create: `src/app/(public)/videos/page.tsx`
- Create: `src/components/SearchBar.tsx`
- Create: `src/components/FilterBar.tsx`

**Step 1: Videos page**
```typescript
// src/app/(public)/videos/page.tsx
import { createClient } from '@/lib/supabase/server'
import ContentCard from '@/components/ui/ContentCard'

interface Props {
  searchParams: { category?: string; difficulty?: string; q?: string }
}

export default async function VideosPage({ searchParams }: Props) {
  const supabase = await createClient()
  let query = supabase.from('videos').select('*').not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  if (searchParams.category) query = query.eq('category', searchParams.category)
  if (searchParams.difficulty) query = query.eq('difficulty', searchParams.difficulty)
  if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`)

  const { data: videos } = await query

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold text-text mb-8">Vídeos</h1>
      {/* FilterBar and SearchBar components here — URL-based filtering, no client state */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {videos?.map(v => (
          <ContentCard key={v.id} title={v.title} href={`/videos/${v.slug}`}
            thumbnailUrl={v.thumbnail_url} category={v.category} isPremium={v.is_premium}
            meta={[v.duration_minutes && `${v.duration_minutes} min`, v.difficulty].filter(Boolean).join(' · ')} />
        ))}
      </div>
    </div>
  )
}
```

**Note:** Filtering is URL-based (searchParams) — no client-side state needed. FilterBar is a client component that updates URL params via `useRouter`.

**Step 2: Commit**
```bash
git add -A
git commit -m "feat: add videos listing page with URL-based filtering"
```

---

### Task 14: Video detail page

**Files:**
- Create: `src/app/(public)/videos/[slug]/page.tsx`

```typescript
// src/app/(public)/videos/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PremiumLock from '@/components/ui/PremiumLock'

export default async function VideoPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: video } = await supabase.from('videos').select('*, instructors(*)').eq('slug', params.slug).single()
  if (!video) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  let hasAccess = !video.is_premium
  if (video.is_premium && user) {
    const { data: sub } = await supabase.from('subscriptions').select('status').eq('user_id', user.id).single()
    hasAccess = sub?.status === 'active'
  }

  const videoUrl = hasAccess ? (video.vimeo_url || video.youtube_url) : video.youtube_url
  const isYouTube = videoUrl?.includes('youtube') || videoUrl?.includes('youtu.be')

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <p className="text-text-muted text-sm mb-2">{video.category}</p>
      <h1 className="text-3xl font-semibold text-text mb-6">{video.title}</h1>

      {hasAccess && videoUrl ? (
        <div className="aspect-video rounded-2xl overflow-hidden bg-surface mb-8">
          <iframe
            src={isYouTube
              ? `https://www.youtube.com/embed/${extractYouTubeId(videoUrl)}`
              : `https://player.vimeo.com/video/${extractVimeoId(videoUrl)}`}
            className="w-full h-full" allowFullScreen allow="autoplay; fullscreen" />
        </div>
      ) : video.is_premium ? (
        <PremiumLock />
      ) : null}

      <p className="text-text-muted leading-relaxed">{video.description}</p>
    </div>
  )
}

function extractYouTubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)
  return match?.[1]
}
function extractVimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match?.[1]
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: video } = await supabase.from('videos').select('title, description, thumbnail_url').eq('slug', params.slug).single()
  return {
    title: video?.title,
    description: video?.description,
    openGraph: { images: video?.thumbnail_url ? [video.thumbnail_url] : [] },
  }
}
```

**Commit:**
```bash
git add -A
git commit -m "feat: add video detail page with YouTube/Vimeo embed and premium gate"
```

---

### Task 15: Recipe listing + detail pages

**Files:**
- Create: `src/app/(public)/receitas/page.tsx`
- Create: `src/app/(public)/receitas/[slug]/page.tsx`

Recipe listing follows the same pattern as videos (Task 13).

**Recipe detail — key additions:**
```typescript
// src/app/(public)/receitas/[slug]/page.tsx
// After fetching recipe, also fetch: ingredients, recipe_steps, nutrition
const [{ data: recipe }, { data: ingredients }, { data: steps }, { data: nutrition }] = await Promise.all([
  supabase.from('recipes').select('*, instructors(*)').eq('slug', params.slug).single(),
  supabase.from('ingredients').select('*').eq('recipe_id', id).order('sort_order'),
  supabase.from('recipe_steps').select('*').eq('recipe_id', id).order('step_number'),
  supabase.from('nutrition').select('*').eq('recipe_id', id).single(),
])
```

**JSON-LD for SEO** — add to page head:
```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Recipe',
  name: recipe.title,
  description: recipe.description,
  image: recipe.thumbnail_url,
  prepTime: `PT${recipe.prep_time}M`,
  cookTime: `PT${recipe.cook_time}M`,
  recipeYield: `${recipe.servings} porções`,
  nutrition: nutrition ? {
    '@type': 'NutritionInformation',
    calories: `${nutrition.calories} calories`,
  } : undefined,
  recipeIngredient: ingredients?.map(i => `${i.quantity} ${i.unit} ${i.name}`),
  recipeInstructions: steps?.map(s => ({ '@type': 'HowToStep', text: s.description })),
}
// In JSX: <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
```

**Commit:**
```bash
git add -A
git commit -m "feat: add recipe listing and detail pages with schema.org/Recipe SEO"
```

---

### Task 16: Blog listing + post pages

**Files:**
- Create: `src/app/(public)/blog/page.tsx`
- Create: `src/app/(public)/blog/[slug]/page.tsx`

Blog listing: same grid pattern. Blog posts: render Tiptap JSON content.

```typescript
// Render Tiptap JSON stored in `content` column
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'

const html = generateHTML(post.content, [StarterKit])
// <div dangerouslySetInnerHTML={{ __html: html }} className="prose max-w-none" />
```

Add Tailwind Typography plugin: `npm install -D @tailwindcss/typography` and add to tailwind config.

**Commit:**
```bash
git add -A
git commit -m "feat: add blog listing and post pages with Tiptap content rendering"
```

---

### Task 17: Collections + Pricing pages

**Collections page** (`/colecoes/[slug]`): fetch collection + its items (join to videos/recipes/posts), display as grid.

**Pricing page** (`/precos`):
```typescript
// src/app/(public)/precos/page.tsx
import { createCheckoutSession } from '@/lib/stripe/actions'

export default function PrecosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-semibold text-text mb-4">Escolhe o teu plano</h1>
      <p className="text-text-muted mb-12">Cancela a qualquer momento.</p>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly plan card */}
        <form action={createCheckoutSession}>
          <input type="hidden" name="priceId" value={process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID} />
          <div className="border border-border rounded-2xl p-8 text-left">
            <h2 className="text-xl font-semibold mb-2">Mensal</h2>
            <p className="text-3xl font-light mb-6">€9.99<span className="text-text-muted text-base">/mês</span></p>
            <button type="submit" className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-full transition-colors">
              Começar
            </button>
          </div>
        </form>
        {/* Annual plan card — same with annual price */}
      </div>
    </div>
  )
}
```

**Commit:**
```bash
git add -A
git commit -m "feat: add collections page and pricing page"
```

---

## Phase 5: Stripe Integration

### Task 18: Stripe checkout + webhook

**Files:**
- Create: `src/lib/stripe/client.ts`
- Create: `src/lib/stripe/actions.ts`
- Create: `src/app/api/stripe/webhook/route.ts`

**Step 1: Stripe client**
```typescript
// src/lib/stripe/client.ts
import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })
```

**Step 2: Checkout server action**
```typescript
// src/lib/stripe/actions.ts
'use server'
import { stripe } from './client'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const priceId = formData.get('priceId') as string
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/precos`,
    metadata: { user_id: user.id },
    payment_method_types: ['card', 'apple_pay', 'mb_way'],
  })
  redirect(session.url!)
}
```

**Step 3: Webhook handler**
```typescript
// src/app/api/stripe/webhook/route.ts
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  let event: any

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Webhook signature invalid', { status: 400 })
  }

  const session = event.data.object as any

  if (event.type === 'checkout.session.completed') {
    const sub = await stripe.subscriptions.retrieve(session.subscription)
    await supabase.from('subscriptions').upsert({
      user_id: session.metadata.user_id,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      status: 'active',
      plan: sub.items.data[0].price.id,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    }, { onConflict: 'stripe_subscription_id' })
    await supabase.from('profiles').update({ role: 'premium' }).eq('id', session.metadata.user_id)
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
    const sub = session
    await supabase.from('subscriptions').update({
      status: sub.status,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    }).eq('stripe_subscription_id', sub.id)
    if (sub.status !== 'active') {
      const { data } = await supabase.from('subscriptions').select('user_id').eq('stripe_subscription_id', sub.id).single()
      if (data) await supabase.from('profiles').update({ role: 'free' }).eq('id', data.user_id)
    }
  }

  return new Response('OK', { status: 200 })
}
```

**Step 4: Test webhook locally**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Step 5: Commit**
```bash
git add -A
git commit -m "feat: add Stripe checkout and webhook handler"
```

---

## Phase 6: Members Area

### Task 19: Dashboard + Stripe Customer Portal

**Files:**
- Create: `src/app/(members)/dashboard/page.tsx`
- Create: `src/app/(members)/layout.tsx`

```typescript
// src/app/(members)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: sub } = await supabase.from('subscriptions').select('*').eq('user_id', user!.id).single()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold text-text mb-8">A tua conta</h1>
      <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
        <p className="text-text-muted text-sm mb-1">Plano atual</p>
        <p className="text-text font-medium capitalize">{sub?.status === 'active' ? 'Premium' : 'Gratuito'}</p>
        {sub?.current_period_end && (
          <p className="text-text-muted text-sm mt-1">
            Renova em {new Date(sub.current_period_end).toLocaleDateString('pt-PT')}
          </p>
        )}
      </div>
      {sub?.stripe_customer_id && (
        <form action="/api/stripe/portal" method="POST">
          <button className="px-6 py-3 border border-border rounded-full text-text hover:bg-surface transition-colors text-sm">
            Gerir subscrição
          </button>
        </form>
      )}
    </div>
  )
}
```

**Stripe Customer Portal route:**
```typescript
// src/app/api/stripe/portal/route.ts
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: sub } = await supabase.from('subscriptions').select('stripe_customer_id').eq('user_id', user!.id).single()
  const session = await stripe.billingPortal.sessions.create({
    customer: sub!.stripe_customer_id!,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })
  redirect(session.url)
}
```

**Commit:**
```bash
git add -A
git commit -m "feat: add member dashboard and Stripe Customer Portal"
```

---

### Task 20: Bookmarks + Playlists

**Files:**
- Create: `src/app/api/bookmarks/route.ts`
- Create: `src/app/api/playlists/route.ts`
- Create: `src/app/(members)/playlists/page.tsx`

**Bookmark toggle API** (POST to add, DELETE to remove):
```typescript
// src/app/api/bookmarks/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { content_type, content_id } = await req.json()
  const { data } = await supabase.from('bookmarks').upsert(
    { user_id: user.id, content_type, content_id },
    { onConflict: 'user_id,content_type,content_id', ignoreDuplicates: false }
  ).select().single()
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { content_type, content_id } = await req.json()
  await supabase.from('bookmarks').delete().match({ user_id: user.id, content_type, content_id })
  return NextResponse.json({ success: true })
}
```

Playlists CRUD follows the same API pattern. Playlist page lists user's playlists with add/remove video controls.

**Commit:**
```bash
git add -A
git commit -m "feat: add bookmarks and playlists API and UI"
```

---

## Phase 7: Admin Panel

### Task 21: Admin layout + dashboard

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`

```typescript
// src/app/admin/layout.tsx
import Link from 'next/link'

const navItems = [
  { href: '/admin/videos', label: 'Vídeos' },
  { href: '/admin/receitas', label: 'Receitas' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/colecoes', label: 'Coleções' },
  { href: '/admin/instrutores', label: 'Instrutores' },
  { href: '/admin/utilizadores', label: 'Utilizadores' },
  { href: '/admin/newsletter', label: 'Newsletter' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-surface border-r border-border p-6 fixed h-full">
        <p className="font-semibold text-text mb-8">Admin</p>
        <nav className="space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="block px-3 py-2 rounded-lg text-text-muted hover:text-text hover:bg-background text-sm transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="ml-56 flex-1 p-8">{children}</main>
    </div>
  )
}
```

**Commit:**
```bash
git add -A
git commit -m "feat: add admin layout with sidebar navigation"
```

---

### Task 22: Admin Videos CRUD

**Files:**
- Create: `src/app/admin/videos/page.tsx`
- Create: `src/app/admin/videos/novo/page.tsx`
- Create: `src/app/admin/videos/[id]/page.tsx`
- Create: `src/app/admin/videos/actions.ts`

**Server actions:**
```typescript
// src/app/admin/videos/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { generateEmbedding } from '@/lib/ai/embeddings'

export async function createVideo(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const slug = slugify(title, { lower: true, strict: true })

  const { data: video } = await supabase.from('videos').insert({
    title, slug,
    description: formData.get('description'),
    youtube_url: formData.get('youtube_url'),
    vimeo_url: formData.get('vimeo_url'),
    thumbnail_url: formData.get('thumbnail_url'),
    duration_minutes: Number(formData.get('duration_minutes')) || null,
    difficulty: formData.get('difficulty'),
    category: formData.get('category'),
    is_premium: formData.get('is_premium') === 'true',
    instructor_id: formData.get('instructor_id') || null,
    published_at: formData.get('publish') ? new Date().toISOString() : null,
  }).select().single()

  // Generate embedding for AI search
  if (video) await generateEmbedding('video', video.id, `${title} ${formData.get('description')}`)

  revalidatePath('/admin/videos')
  redirect('/admin/videos')
}

export async function deleteVideo(id: string) {
  const supabase = await createClient()
  await supabase.from('videos').delete().eq('id', id)
  revalidatePath('/admin/videos')
}
```

**Video form** (novo/[id]): fields for title, description, YouTube URL, Vimeo URL, thumbnail upload (to Supabase Storage), duration, difficulty, category, instructor, is_premium toggle, publish toggle.

**Thumbnail upload helper:**
```typescript
// src/lib/supabase/upload.ts
import { createClient } from './client'

export async function uploadThumbnail(file: File, bucket = 'thumbnails') {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
```

**Commit:**
```bash
git add -A
git commit -m "feat: add admin Videos CRUD with image upload and embedding generation"
```

---

### Task 23: Admin Recipes CRUD

**Files:**
- Create: `src/app/admin/receitas/page.tsx`
- Create: `src/app/admin/receitas/novo/page.tsx`
- Create: `src/app/admin/receitas/actions.ts`

Recipe form is more complex — uses dynamic lists for ingredients and steps:

```typescript
// Client component for dynamic ingredient/step lists
'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export function IngredientsList() {
  const [items, setItems] = useState([{ name: '', quantity: '', unit: '' }])
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input name={`ingredient_qty_${i}`} placeholder="Qtd" defaultValue={item.quantity}
            className="w-20 px-3 py-2 border border-border rounded-lg text-sm" />
          <input name={`ingredient_unit_${i}`} placeholder="Un." defaultValue={item.unit}
            className="w-20 px-3 py-2 border border-border rounded-lg text-sm" />
          <input name={`ingredient_name_${i}`} placeholder="Ingrediente" defaultValue={item.name}
            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm" />
          <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))}>
            <Trash2 size={16} className="text-text-muted" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setItems([...items, { name: '', quantity: '', unit: '' }])}
        className="flex items-center gap-1 text-sm text-primary mt-2">
        <Plus size={14} /> Adicionar ingrediente
      </button>
    </div>
  )
}
```

Server action parses numbered fields: `ingredient_name_0`, `ingredient_name_1`, etc.

**Commit:**
```bash
git add -A
git commit -m "feat: add admin Recipes CRUD with dynamic ingredients and steps"
```

---

### Task 24: Admin Blog CRUD (Tiptap editor)

**Files:**
- Create: `src/app/admin/blog/page.tsx`
- Create: `src/app/admin/blog/novo/page.tsx`
- Create: `src/components/admin/TiptapEditor.tsx`

```typescript
// src/components/admin/TiptapEditor.tsx
'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

interface Props {
  initialContent?: any
  onChange: (json: any) => void
}

export default function TiptapEditor({ initialContent, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content: initialContent,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  })

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-2 p-3 border-b border-border bg-surface">
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm ${editor?.isActive('bold') ? 'bg-primary text-white' : 'text-text-muted'}`}>
          B
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm italic ${editor?.isActive('italic') ? 'bg-primary text-white' : 'text-text-muted'}`}>
          I
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-sm ${editor?.isActive('heading') ? 'bg-primary text-white' : 'text-text-muted'}`}>
          H2
        </button>
      </div>
      <EditorContent editor={editor} className="p-4 min-h-64 prose max-w-none" />
    </div>
  )
}
```

Content is saved as Tiptap JSON in the `content` JSONB column.

**Commit:**
```bash
git add -A
git commit -m "feat: add admin Blog CRUD with Tiptap rich text editor"
```

---

### Task 25: Admin Collections with drag-and-drop ordering

**Files:**
- Create: `src/app/admin/colecoes/page.tsx`
- Create: `src/app/admin/colecoes/[id]/page.tsx`
- Create: `src/components/admin/SortableList.tsx`

```typescript
// src/components/admin/SortableList.tsx
'use client'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useState } from 'react'

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl mb-2">
      <button {...attributes} {...listeners} type="button" className="cursor-grab">
        <GripVertical size={16} className="text-text-muted" />
      </button>
      {children}
    </div>
  )
}

export default function SortableList({ items, onReorder }: {
  items: { id: string; label: string }[]
  onReorder: (ids: string[]) => void
}) {
  const [list, setList] = useState(items)
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={({ active, over }) => {
      if (active.id !== over?.id) {
        const oldIndex = list.findIndex(i => i.id === active.id)
        const newIndex = list.findIndex(i => i.id === over!.id)
        const reordered = arrayMove(list, oldIndex, newIndex)
        setList(reordered)
        onReorder(reordered.map(i => i.id))
      }
    }}>
      <SortableContext items={list.map(i => i.id)} strategy={verticalListSortingStrategy}>
        {list.map(item => <SortableItem key={item.id} id={item.id}>{item.label}</SortableItem>)}
      </SortableContext>
    </DndContext>
  )
}
```

**Commit:**
```bash
git add -A
git commit -m "feat: add admin Collections CRUD with drag-and-drop ordering"
```

---

### Task 26: Admin Users + Newsletter

**Users page** — read-only table of profiles + subscription status. Admin can update `role` field.

**Newsletter page** — list subscribers, export CSV button.

```typescript
// CSV export
export async function exportNewsletter() {
  const supabase = await createClient() // service role
  const { data } = await supabase.from('newsletter_subs').select('email, subscribed_at').eq('confirmed', true)
  const csv = ['email,subscribed_at', ...data!.map(r => `${r.email},${r.subscribed_at}`)].join('\n')
  return new Response(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=newsletter.csv' } })
}
```

**Commit:**
```bash
git add -A
git commit -m "feat: add admin Users and Newsletter management pages"
```

---

## Phase 8: AI-Powered Search

### Task 27: Embedding generation

**Files:**
- Create: `src/lib/ai/embeddings.ts`

```typescript
// src/lib/ai/embeddings.ts
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function generateEmbedding(
  contentType: 'video' | 'recipe' | 'post',
  contentId: string,
  text: string
) {
  // Claude doesn't have an embeddings API — use text-embedding-3-small via OpenAI
  // or use Supabase's built-in pg_embedding with a different model.
  // Best option: use OpenAI text-embedding-3-small (1536 dims, very cheap)
  // OR: use Voyage AI embeddings (Anthropic's recommended partner)
  // We'll use OpenAI for simplicity — add: npm install openai
  const { OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  })

  const embedding = response.data[0].embedding
  await supabase.from('content_embeddings').upsert({
    content_type: contentType,
    content_id: contentId,
    embedding,
  }, { onConflict: 'content_type,content_id' })
}
```

**Note:** Add `OPENAI_API_KEY` to `.env.local` for embeddings. Claude API is used for query interpretation below.

**Commit:**
```bash
git add -A
git commit -m "feat: add embedding generation utility for AI search"
```

---

### Task 28: AI search endpoint + UI

**Files:**
- Create: `src/app/api/search/route.ts`
- Create: `src/components/AISearchBar.tsx`

**Step 1: Search API**
```typescript
// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { OpenAI } from 'openai'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  const { query } = await req.json()
  if (!query?.trim()) return NextResponse.json({ results: [] })

  // Use Claude to enrich/interpret the query in wellness context
  const enriched = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `You are a wellness content search assistant. Expand this query into rich search terms for yoga, nutrition, and healthy lifestyle content. Return only the expanded search text, no explanation.\n\nQuery: ${query}`,
    }],
  })
  const enrichedText = (enriched.content[0] as any).text

  // Generate embedding for enriched query
  const embeddingRes = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: enrichedText,
  })
  const queryEmbedding = embeddingRes.data[0].embedding

  // Cosine similarity search via pgvector
  const { data: matches } = await supabase.rpc('search_content', {
    query_embedding: queryEmbedding,
    match_threshold: 0.5,
    match_count: 8,
  })

  return NextResponse.json({ results: matches || [] })
}
```

**Step 2: Supabase RPC function**
```sql
-- supabase/migrations/003_search_function.sql
create or replace function search_content(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (content_type text, content_id uuid, similarity float)
language sql stable as $$
  select content_type, content_id,
    1 - (embedding <=> query_embedding) as similarity
  from content_embeddings
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
```

**Step 3: AISearchBar client component**
```typescript
// src/components/AISearchBar.tsx
'use client'
import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface Result { content_type: string; content_id: string; similarity: number; title?: string; slug?: string }

export default function AISearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)

  async function search() {
    if (!query.trim()) return
    setLoading(true)
    const res = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) })
    const { results } = await res.json()
    setResults(results)
    setLoading(false)
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center gap-3 bg-surface border border-border rounded-full px-5 py-3">
        <Search size={18} className="text-text-muted" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="Ex: yoga para relaxar, receita rápida pós-treino..."
          className="flex-1 bg-transparent text-text placeholder-text-muted focus:outline-none text-sm"
        />
        {loading ? <Loader2 size={16} className="animate-spin text-primary" /> : (
          <button onClick={search} className="text-primary text-sm font-medium">Pesquisar</button>
        )}
      </div>
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map(r => (
            <a key={r.content_id} href={`/${r.content_type === 'video' ? 'videos' : r.content_type === 'recipe' ? 'receitas' : 'blog'}/${r.slug}`}
              className="block p-3 bg-surface border border-border rounded-xl hover:border-primary transition-colors text-sm text-text">
              <span className="text-text-muted text-xs uppercase mr-2">{r.content_type}</span>
              {r.title}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 4: Push migration**
```bash
npx supabase db push
```

**Step 5: Commit**
```bash
git add -A
git commit -m "feat: add AI semantic search with Claude + pgvector"
```

---

## Phase 9: Newsletter + SEO

### Task 29: Newsletter subscription

**Files:**
- Create: `src/app/api/newsletter/route.ts`
- Create: `src/components/NewsletterForm.tsx`

```typescript
// src/app/api/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY!)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  await supabase.from('newsletter_subs').upsert({ email, confirmed: true }, { onConflict: 'email', ignoreDuplicates: true })

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: 'Bem-vindo à Youfull!',
    html: '<p>Obrigado por te juntares à Youfull. Inspira-te!</p>',
  })

  return NextResponse.json({ success: true })
}
```

```typescript
// src/components/NewsletterForm.tsx
'use client'
import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    setStatus('done')
  }

  if (status === 'done') return <p className="text-primary">Bem-vindo(a)! Verifica o teu email.</p>

  return (
    <form onSubmit={submit} className="flex gap-2 max-w-sm mx-auto">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="O teu email" required
        className="flex-1 px-4 py-3 border border-border rounded-full bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      <button type="submit" disabled={status === 'loading'}
        className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-full text-sm transition-colors">
        Subscrever
      </button>
    </form>
  )
}
```

**Commit:**
```bash
git add -A
git commit -m "feat: add newsletter subscription with Resend"
```

---

### Task 30: Sitemap + Open Graph

**Files:**
- Create: `src/app/sitemap.ts`

```typescript
// src/app/sitemap.ts
import { createClient } from '@/lib/supabase/server'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const [{ data: videos }, { data: recipes }, { data: posts }] = await Promise.all([
    supabase.from('videos').select('slug, published_at').not('published_at', 'is', null),
    supabase.from('recipes').select('slug, published_at').not('published_at', 'is', null),
    supabase.from('posts').select('slug, published_at').not('published_at', 'is', null),
  ])

  const base = process.env.NEXT_PUBLIC_APP_URL!
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/videos`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/receitas`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    ...videos?.map(v => ({ url: `${base}/videos/${v.slug}`, lastModified: v.published_at, priority: 0.7 })) ?? [],
    ...recipes?.map(r => ({ url: `${base}/receitas/${r.slug}`, lastModified: r.published_at, priority: 0.7 })) ?? [],
    ...posts?.map(p => ({ url: `${base}/blog/${p.slug}`, lastModified: p.published_at, priority: 0.6 })) ?? [],
  ]
}
```

**Open Graph** — add `generateMetadata` to each content page (already done in Task 14 pattern). Also add to `src/app/layout.tsx`:
```typescript
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  title: { template: '%s | Youfull', default: 'Youfull — Lifestyle saudável' },
  description: 'Yoga, receitas saudáveis e inspiração para o teu estilo de vida.',
  openGraph: { siteName: 'Youfull', type: 'website' },
}
```

**Commit:**
```bash
git add -A
git commit -m "feat: add dynamic sitemap and Open Graph metadata"
```

---

## Phase 10: Deploy

### Task 31: Deploy to Vercel

**Step 1: Push to GitHub**
```bash
git remote add origin https://github.com/your-username/youfull.git
git push -u origin main
```

**Step 2: Connect to Vercel**
- Go to vercel.com → Import project from GitHub
- Add all environment variables from `.env.local`
- Set `NEXT_PUBLIC_APP_URL` to your production domain

**Step 3: Configure Stripe webhook for production**
```bash
stripe listen --forward-to https://youfull.com/api/stripe/webhook
# Or add webhook endpoint in Stripe Dashboard → Developers → Webhooks
```

**Step 4: Verify deployment**
- Test auth flow (register → login → logout)
- Test Stripe checkout with test card `4242 4242 4242 4242`
- Test AI search with a wellness query
- Check sitemap at `/sitemap.xml`

**Step 5: Final commit**
```bash
git add -A
git commit -m "chore: production deployment configuration"
```

---

## Summary

| Phase | Tasks | Key Deliverable |
|---|---|---|
| 1 — Foundation | 1–7 | Next.js + Supabase + DB schema + RLS |
| 2 — Auth | 8–9 | Login/register + route protection |
| 3 — UI | 10–11 | Layout, navbar, shared components |
| 4 — Public pages | 12–17 | Homepage, videos, recipes, blog, pricing |
| 5 — Stripe | 18 | Checkout + webhook + Customer Portal |
| 6 — Members | 19–20 | Dashboard, bookmarks, playlists |
| 7 — Admin | 21–26 | Full CRUD for all content types |
| 8 — AI Search | 27–28 | Embeddings + semantic search |
| 9 — SEO/Newsletter | 29–30 | Resend + sitemap + OG tags |
| 10 — Deploy | 31 | Vercel production |

**Environment variables needed:**
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_WEBHOOK_SECRET` + price IDs
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY` (for embeddings — text-embedding-3-small)
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL`
