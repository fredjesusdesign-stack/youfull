# Youfull — Contexto do Projeto

## O que é este projeto

**Youfull** é uma plataforma de lifestyle saudável (yoga, receitas, blog) com área de membros premium.
Stack: Next.js 16, React 19, Tailwind CSS 4, Supabase, Stripe, Vercel.

## Como correr localmente

```bash
npm run dev        # inicia em localhost:3000
npm run build      # build de produção
```

Node está em `/Users/fredjesus/Documents/Fred/.node/bin/` — usar este path quando precisar de npx/node no terminal.

## Deploy

**Vercel** — deploy automático a cada `git push origin main`. Não há CI/CD adicional.

```bash
git push origin main   # → Vercel faz deploy automaticamente
```

## Supabase

Usado para: autenticação, base de dados, storage de imagens.

- `src/lib/supabase/client.ts` — cliente browser
- `src/lib/supabase/server.ts` — cliente server (Server Actions, Server Components)
- `src/lib/supabase/middleware.ts` — gestão de sessão no middleware
- `src/lib/supabase/upload.ts` — helper `uploadImage(file, bucket)` (legado, usar diretamente nos componentes)

### Buckets de Storage

- `thumbnails` — thumbnails de vídeos, receitas, blog, coleções
- `avatars` — fotos de perfil de instrutores

## Estrutura de pastas relevante

```
src/
  app/
    (public)/          # páginas públicas (/, /videos, /receitas, /blog, /colecoes, /instrutores)
    (auth)/            # login, registo, actions
    (members)/         # área de membros (playlists) — requer subscrição ativa
    dashboard/         # página de dashboard do utilizador autenticado
    admin/             # painel admin (requer role='admin')
      videos/          # CRUD de vídeos
      receitas/        # CRUD de receitas
      blog/            # CRUD de posts
      colecoes/        # CRUD de coleções
      instrutores/     # CRUD de instrutores
      utilizadores/    # lista de utilizadores
      newsletter/      # lista de subscritores
    api/               # routes API (stripe webhook, search, bookmarks, playlists, newsletter)
  components/
    admin/             # formulários e componentes do painel admin
    ui/                # componentes partilhados (ContentCard, Badge, LoadingGrid, PremiumLock)
    Navbar, Footer, MobileMenu, AISearchBar, etc.
  lib/
    supabase/          # clientes e helpers
    stripe/            # cliente e server actions de Stripe
    ai/                # embeddings para pesquisa AI (OpenAI text-embedding-3-small)
```

## Autenticação e roles

Gerida pelo Supabase Auth + middleware em `src/middleware.ts`:

- `/admin/*` — requer `profiles.role = 'admin'`
- `/members/*` — requer `subscriptions.status = 'active'`
- `/login`, `/registo` — redireciona para `/dashboard` se já autenticado

## Formulários admin

Todos os forms admin usam **Server Actions** com `action={serverAction}`. O pattern é:
1. Form com campos + inputs hidden para dados geridos por estado React
2. Server action recebe `FormData`, faz upsert no Supabase, `revalidatePath` + `redirect`

### Forms com upload de imagem

| Componente | Bucket | Crop modal |
|---|---|---|
| `VideoForm.tsx` | `thumbnails` | ✅ via `ImageCropUpload` |
| `PostForm.tsx` | `thumbnails` | ✅ via `ImageCropUpload` |
| `RecipeForm.tsx` | `thumbnails` | ✅ via `ImageCropUpload` |
| `CollectionForm.tsx` | `thumbnails` | ❌ upload direto |
| `InstructorForm.tsx` | `avatars` | ❌ upload direto |

### ImageCropUpload component

`src/components/admin/ImageCropUpload.tsx` — componente partilhado de upload com crop.

- Usa `react-easy-crop` com aspect ratio 16:9 fixo
- Mostra dimensões originais da imagem (ex: `1920 × 1080 px`)
- Faz crop via canvas → gera JPEG blob → upload para Supabase
- Props: `value: string`, `onChange: (url: string) => void`, `bucket: string`, `pathPrefix?: string`
- Upload SÓ acontece ao clicar "Aplicar" (não ao selecionar o ficheiro)

## Thumbnails — aspect ratios

- **Cards nas listagens** (`ContentCard.tsx`) → `aspect-[4/3]`
- **Páginas de detalhe** (blog, receitas, vídeos, coleções) → `aspect-[16/9]`
- **Preview no admin form** → `aspect-video` (16:9)

## AI Search

`src/lib/ai/embeddings.ts` + `src/app/api/search/route.ts`

- Gera embeddings (OpenAI `text-embedding-3-small`) ao criar/editar vídeos, receitas e posts
- Guarda em tabela `content_embeddings` no Supabase
- `AISearchBar.tsx` usa a API route `/api/search`
- Funciona sem OpenAI key configurada (skip silencioso)

## Stripe / Subscrições

- `src/lib/stripe/` — cliente e server actions
- Webhook em `src/app/api/stripe/webhook/route.ts`
- Preços na página pública `/precos`

## Convenções de código

- **Tailwind CSS 4** — sem `tailwind.config.js`, usa CSS variables no globals.css
- CSS variables de tema: `--color-primary`, `--color-background`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-surface`
- Classes comuns: `text-text`, `text-text-muted`, `bg-background`, `bg-surface`, `border-border`, `text-primary`, `bg-primary`
- Botões primários: `bg-primary hover:bg-primary-dark text-white rounded-full`
- Inputs: `w-full px-3 py-2.5 border border-border rounded-xl bg-background text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors`
- Sem test suite configurada — verificação via `npx tsc --noEmit`
- Server Actions usam `'use server'` no topo
- Client Components usam `'use client'` no topo

## Últimas alterações (2026-03-05)

- Adicionado `react-easy-crop`
- Criado `src/components/admin/ImageCropUpload.tsx`
- `VideoForm`, `PostForm`, `RecipeForm` atualizados para usar `ImageCropUpload`
- Design doc em `docs/plans/2026-03-05-image-crop-upload-design.md`

## Repositório

GitHub: `fredjesusdesign-stack/youfull` (branch `main`)
