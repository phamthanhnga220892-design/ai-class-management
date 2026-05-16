# Showcase Product Detail Modal — Design Spec
Date: 2026-05-16

## Overview

Add a product detail modal to the public Showcase page (`/showcase`). Clicking any product card (featured or regular) opens a modal showing full product information, downloadable file attachments, and a link to the student's portfolio page.

## Goals

- Allow visitors to view full product details without leaving the showcase page
- Allow downloading attached files directly from the modal
- Navigate to the student's portfolio (`/portfolio/:userId`) from the modal

## Scope

**Only file changed:** `frontend/src/app/showcase/page.tsx`

No new API endpoints, no new routes, no new files needed. All data is already present in the `ShowcaseResponse` fetched on page load.

## UX Flow

1. Visitor is on `/showcase`
2. Clicks anywhere on a `FeaturedCard` or `ProductCard`
3. `ProductDetailModal` opens with that product's data
4. Visitor can:
   - Read full description (no line-clamp)
   - Click **"⬇ Tải xuống"** per file to download
   - Click **"🔗 Xem dự án"** to open the project link in a new tab
   - Click **"Xem portfolio →"** next to the owner name, or the footer button, to open `/portfolio/:userId` in a new tab
5. Modal closes via: ✕ button, clicking backdrop, or Escape key

## Component: ProductDetailModal

### Props
```ts
interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}
```
Renders `null` when `product` is `null`.

### Layout (top to bottom)

**Thumbnail area**
- If `product.thumbnail`: `<img>` fullwidth, `max-h-72`, `object-cover`, rounded top corners
- Else: gradient placeholder div `h-48`, centered 🎨 emoji, `text-6xl`

**Header section** (padded content area)
- Featured badge: `⭐ Nổi bật` yellow pill badge — shown only if `product.isFeatured === true`
- Title: `text-2xl font-bold`
- Owner row: `👤 {fullName}` + inline link **"Xem portfolio →"** → opens `/portfolio/{userId}` in new tab

**Body section**
- Full description (no `line-clamp`)
- Project link button (if `product.link`): primary style, opens new tab, label "🔗 Xem dự án"

**Attachments section** (if `product.files.length > 0`)
- Label: `📎 Tệp đính kèm:`
- Each file: one row = `[icon] [filename truncated] [⬇ Tải xuống button]`
- Download logic: reuse `getFileHref()` — for `document` type, inject `fl_attachment:{safe_filename}` into Cloudinary URL; for `image`/`video`, use URL directly
- Download button: `<a href={getFileHref(...)} download={filename} target="_blank">⬇ Tải xuống</a>`

**Footer**
- Left: "Đóng" ghost button → calls `onClose()`
- Right: "→ Xem portfolio học viên" primary button → opens `/portfolio/{userId}` new tab
- Footer only shown when `userId` is available (i.e., `product.user` is populated object)

### Accessibility & Behavior
- `overflow-y-auto` on modal content, `max-h-[90vh]` to handle long descriptions/many files
- Backdrop click closes modal
- `useEffect` adds/removes `keydown` listener for Escape key while modal is open
- Modal is `z-50`, backdrop `bg-black/50`

## State Changes in ShowcasePage

Add one state variable:
```ts
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
```

Update `FeaturedCard` and `ProductCard`:
- Accept `onClick: () => void` prop
- Wrap root element with `cursor-pointer` and call `onClick` on click
- Ensure inner links (project link, file downloads) use `e.stopPropagation()` to prevent triggering the modal

Render `<ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />` at the bottom of the page JSX.

## Helper: getUserId(product)

```ts
function getUserId(product: Product): string {
  if (product.user && typeof product.user === 'object') {
    return (product.user as any)._id || '';
  }
  return typeof product.user === 'string' ? product.user : '';
}
```

Already have `getOwnerName()` — add `getUserId()` alongside it.

## Out of Scope

- No new API endpoint (data already in showcase response)
- No new route (`/showcase/[productId]`)
- No image gallery / lightbox for image files
- No auth required (modal is public)
