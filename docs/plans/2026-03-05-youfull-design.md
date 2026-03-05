# Youfull — Design Document

**Date:** 2026-03-05
**Status:** Approved

---

## Overview

Youfull is a wellness lifestyle platform for people who want a healthier, lighter way of living — yoga, wholesome recipes, and curated content. It features video lessons, structured recipes, a blog, and a freemium subscription model.

---

## Target Audience

People who want a better lifestyle: yoga practitioners, healthy eating enthusiasts, wellness seekers. Mobile-first audience.

---

## Business Model

**Freemium** — free content available to all visitors, premium content unlocked via active Stripe subscription. No access gates for registration, but premium content requires a paid plan.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + pgvector) |
| Payments | Stripe (Apple Pay, MB Way, cards) |
| Video (free) | YouTube embed |
| Video (premium) | Vimeo embed |
| Rich text editor | Tiptap |
| Email / Newsletter | Resend |
| AI Search | Claude API (haiku-4-5) + pgvector embeddings |
| Deploy | Vercel (frontend) + Supabase (backend) |

---

## UI & Design System

**Aesthetic:** Minimalist premium — generous white space, calm energy. References: Apple Fitness, Alo Wellness Club, Yoga Collective.

**Typography:** Inter (all weights)

**Color Palette:**
```
Background:   #FAFAF8  (warm off-white)
Surface:      #F4F4F0  (cards, sections)
Primary:      #7C9A6E  (matcha green — CTAs, highlights)
Primary dark: #5A7A52  (hover states)
Text:         #1C1C1A  (near-black, soft)
Muted:        #8C8C87  (secondary text)
Border:       #E8E8E4  (subtle separators)
```

**Component conventions:**
- Cards: subtle border or slightly different background, no heavy shadows
- Primary CTA: `rounded-full` pill buttons
- Images: fixed aspect ratio with `object-cover`
- Navigation: minimal, centered logo (Alo / Yoga Collective style)
- Hero: full-screen image or muted video loop, large headline, single CTA
- Mobile-first layout throughout

---

## Application Structure

```
youfull/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                  # Homepage
│   │   ├── videos/                   # Video listing + detail
│   │   ├── receitas/                 # Recipe listing + detail
│   │   ├── blog/                     # Blog listing + post
│   │   ├── colecoes/[slug]/          # Curated collections
│   │   ├── instrutores/[slug]/       # Instructor profiles
│   │   └── precos/                   # Subscription plans
│   ├── (auth)/                       # Login / Register / Reset
│   ├── (members)/                    # Private area (active subscription required)
│   │   ├── videos/                   # Premium videos (Vimeo)
│   │   ├── receitas/                 # Premium recipes
│   │   ├── dashboard/                # Profile + subscription management
│   │   └── playlists/                # User-created playlists
│   └── admin/                        # Admin panel (role: admin only)
│       ├── videos/
│       ├── receitas/
│       ├── blog/
│       ├── colecoes/
│       ├── instrutores/
│       ├── utilizadores/
│       ├── newsletter/
│       └── configuracoes/
├── components/
├── lib/
│   ├── supabase/                     # Server + client Supabase instances
│   └── stripe/                       # Payment helpers
└── middleware.ts                     # Route protection (auth + subscription check)
```

---

## Database Schema

```sql
-- Content
videos (
  id, title, slug, description, thumbnail_url,
  youtube_url, vimeo_url, duration_minutes,
  difficulty (beginner|intermediate|advanced),
  category, tags[], is_premium, instructor_id, published_at
)

recipes (
  id, title, slug, description, thumbnail_url, video_url,
  prep_time, cook_time, servings, difficulty,
  category, tags[], is_premium, instructor_id, published_at
)

posts (
  id, title, slug, content, thumbnail_url, video_url,
  category, tags[], published_at
)

ingredients     (id, recipe_id, name, quantity, unit, order)
recipe_steps    (id, recipe_id, step_number, description, image_url)
nutrition       (id, recipe_id, calories, protein, carbs, fat, fiber)

-- Content Structure
collections     (id, title, slug, description, thumbnail_url, is_premium, order)
collection_items (id, collection_id, content_type, content_id, order)

-- Users
profiles        (id, full_name, avatar_url, role: free|premium|admin)
subscriptions   (id, user_id, stripe_customer_id, stripe_subscription_id,
                 status, plan, current_period_end)

-- User-generated
playlists       (id, user_id, title, description, is_public)
playlist_items  (id, playlist_id, video_id, order, added_at)
bookmarks       (id, user_id, content_type: video|recipe|post, content_id, created_at)

-- Instructors
instructors     (id, name, slug, bio, avatar_url, instagram_url)

-- Social & Newsletter
social_links    (id, platform, url, is_active)
newsletter_subs (id, email, subscribed_at, confirmed)

-- AI Search
content_embeddings (id, content_type, content_id, embedding vector(1536))
```

**Row Level Security:**
- `is_premium = true` content → only visible to users with `subscription.status = 'active'`
- `/admin` routes → only `role = admin`

---

## Key Features

### 1. Freemium Access
- Visitors see free content (YouTube embeds, free recipes, blog)
- Registered free users get bookmarks and playlist access
- Premium users unlock all content after active Stripe subscription

### 2. AI-Powered Search
User writes natural language ("quero perder peso", "yoga para dormir melhor") and the system returns relevant content across all sections.

**Flow:**
1. On content publish → generate embedding via Claude API → store in `content_embeddings` (pgvector)
2. On user search → convert query to embedding → cosine similarity search → return ranked mix of videos + recipes + posts

### 3. Admin Panel
- CRUD for all content types
- Drag-and-drop ordering for collections
- Image upload via drag & drop → Supabase Storage with preview
- Video: paste YouTube/Vimeo URL with embed preview
- `is_premium` toggle per content item
- Publish / Save as draft
- User management (view members, subscription status, revoke access)
- Newsletter subscriber list + export

### 4. Collections (Admin-curated)
Themed content groups created by admin: "Yoga para iniciantes", "Receitas anti-inflamatórias". Can be free or premium. Displayed on homepage and dedicated pages.

### 5. Playlists (User-created)
Users create their own video playlists (Spotify-style). Can be public or private.

### 6. Bookmarks
Save any content (video, recipe, post) to a personal list. Available to all registered users.

### 7. Filtering & Search
All listing pages (videos, recipes, blog) support:
- Category filter
- Difficulty filter
- Duration filter (videos)
- Free / Premium filter
- Keyword search

### 8. Newsletter
Email capture on public pages, integrated with Resend. Free users stay in conversion funnel to premium.

### 9. SEO
- `schema.org/Recipe` structured data on recipe pages
- Dynamic `sitemap.xml`
- Open Graph meta tags on all content pages
- Blog and recipes optimized for organic search

---

## Subscription Flow

```
Visitor sees locked premium content
→ CTA "Torna-te membro"
→ /precos — plan selection (Monthly / Annual)
→ Stripe Checkout (Apple Pay, MB Way, card)
→ Stripe Webhook → update subscriptions table in Supabase
→ User redirected to /members area
```

**User dashboard (`/dashboard`):**
- Current plan + renewal date
- Cancel subscription (Stripe Customer Portal)
- Update payment method (Stripe Customer Portal)

**Route protection via `middleware.ts`:**
- Check Supabase session + `subscription.status === 'active'`
- Redirect to `/precos` if no active subscription

---

## Public Pages

| Route | Description |
|---|---|
| `/` | Hero + editorial highlights + subscription CTA |
| `/videos` | Grid with filters + LLM search bar |
| `/videos/[slug]` | Player + description + related collections |
| `/receitas` | Grid with filters + LLM search bar |
| `/receitas/[slug]` | Ingredients, steps, nutrition, schema.org/Recipe |
| `/blog` | Post grid |
| `/blog/[slug]` | Rich text article |
| `/colecoes/[slug]` | Curated video/recipe collection |
| `/instrutores/[slug]` | Bio + instructor content |
| `/precos` | Plans + Stripe Checkout |
