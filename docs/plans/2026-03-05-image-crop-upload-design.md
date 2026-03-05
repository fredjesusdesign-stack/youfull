# Image Crop Upload — Design

## Context

Admin forms currently upload images directly to Supabase with no crop step and no dimension info.
Thumbnails are displayed at 4:3 in content cards and 16:9 on detail pages.

## Scope

Add image crop modal + dimension display to: `VideoForm`, `PostForm`, `RecipeForm`.
Not changed: `CollectionForm`, `InstructorForm`.

## Solution

### New component: `src/components/admin/ImageCropUpload.tsx`

Shared component used by the 3 forms. Props:
- `value: string` — current image URL
- `onChange: (url: string) => void` — called after successful upload
- `bucket: string` — supabase storage bucket
- `pathPrefix?: string` — folder prefix for storage path

### Flow

1. User clicks upload area → file picker opens
2. User selects image → modal opens (no upload yet)
3. Modal shows:
   - Image with 16:9 crop area (react-easy-crop) — draggable, scroll to zoom
   - Original dimensions label (e.g. `1920 × 1080`)
   - "Aplicar" and "Cancelar" buttons
4. User clicks "Aplicar" → canvas crops image → generates new File → uploads to Supabase → modal closes
5. `onChange` is called with the public URL

### Library

`react-easy-crop` — installed as new dependency.

### Safety

- All 3 forms keep identical `action(formData)` submission logic
- Only the upload UI block is replaced with `<ImageCropUpload>`
- No changes to server actions, database queries, or form field names
