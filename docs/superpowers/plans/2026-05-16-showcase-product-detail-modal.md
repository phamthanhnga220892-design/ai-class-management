# Showcase Product Detail Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clicking any product card on `/showcase` opens a modal with full details, downloadable files, and a link to the student's portfolio.

**Architecture:** All changes are confined to a single file — `frontend/src/app/showcase/page.tsx`. A new `ProductDetailModal` component is added inline, `FeaturedCard` and `ProductCard` get an `onClick` prop, and `ShowcasePage` gains a `selectedProduct` state to control the modal.

**Tech Stack:** Next.js 16, React 19, TailwindCSS, TypeScript. No new dependencies.

---

### Task 1: Add `getUserId` helper and update card components to be clickable

**Files:**
- Modify: `frontend/src/app/showcase/page.tsx`

- [ ] **Step 1: Add `getUserId` helper below the existing `getOwnerName` function**

In `frontend/src/app/showcase/page.tsx`, after line 18 (end of `getOwnerName`), add:

```typescript
function getUserId(product: Product): string {
    if (product.user && typeof product.user === 'object') {
        return (product.user as any)._id || '';
    }
    return typeof product.user === 'string' ? product.user : '';
}
```

- [ ] **Step 2: Add `onClick` prop to `FeaturedCard` and add `stopPropagation` to inner links**

Replace the `FeaturedCard` component entirely:

```typescript
function FeaturedCard({ product, onClick }: { product: Product; onClick: () => void }) {
    return (
        <div
            className="flex gap-6 bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={onClick}
        >
            {product.thumbnail ? (
                <img
                    src={product.thumbnail.url}
                    alt={product.title}
                    className="w-48 h-36 object-cover rounded-xl flex-shrink-0"
                />
            ) : (
                <div className="w-48 h-36 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex-shrink-0 flex items-center justify-center text-4xl">
                    🎨
                </div>
            )}
            <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold mb-1 truncate">{product.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">👤 {getOwnerName(product)}</p>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
                {product.files?.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                        {product.files.slice(0, 3).map((f) => (
                            <span key={f.publicId} className="text-xs text-muted-foreground flex items-center gap-1">
                                {getFileIcon(f.fileType)} {f.filename}
                            </span>
                        ))}
                    </div>
                )}
                {product.link && (
                    <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                        🔗 Xem dự án
                    </a>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Add `onClick` prop to `ProductCard` and add `stopPropagation` to inner links**

Replace the `ProductCard` component entirely:

```typescript
function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
    return (
        <div
            className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={onClick}
        >
            {product.thumbnail ? (
                <img
                    src={product.thumbnail.url}
                    alt={product.title}
                    className="w-full h-40 object-cover"
                />
            ) : (
                <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-4xl">
                    🎨
                </div>
            )}
            <div className="p-4">
                <h3 className="font-bold mb-1 truncate">{product.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">👤 {getOwnerName(product)}</p>
                <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{product.description}</p>
                {product.link && (
                    <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-primary hover:underline"
                    >
                        🔗 Xem dự án
                    </a>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/showcase/page.tsx
git commit -m "feat(showcase): make product cards clickable with onClick prop"
```

---

### Task 2: Build `ProductDetailModal` component

**Files:**
- Modify: `frontend/src/app/showcase/page.tsx`

- [ ] **Step 1: Add `getFileHref` helper (reused from dashboard/products)**

Add after `getUserId`:

```typescript
function getFileHref(url: string, filename: string, fileType: 'image' | 'video' | 'document'): string {
    if (fileType !== 'document') return url;
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return url.replace('/upload/', `/upload/fl_attachment:${safe}/`);
}
```

- [ ] **Step 2: Add `ProductDetailModal` component after `ProductCard`**

```typescript
function ProductDetailModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
    useEffect(() => {
        if (!product) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [product, onClose]);

    if (!product) return null;

    const userId = getUserId(product);
    const portfolioUrl = userId ? `/portfolio/${userId}` : null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Thumbnail */}
                {product.thumbnail ? (
                    <img
                        src={product.thumbnail.url}
                        alt={product.title}
                        className="w-full max-h-72 object-cover rounded-t-2xl"
                    />
                ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-2xl flex items-center justify-center text-6xl">
                        🎨
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {/* Close button */}
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
                            aria-label="Đóng"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Featured badge */}
                    {product.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full mb-3">
                            ⭐ Nổi bật
                        </span>
                    )}

                    {/* Title */}
                    <h2 className="text-2xl font-bold mb-2">{product.title}</h2>

                    {/* Owner + portfolio link */}
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        <span>👤 {getOwnerName(product)}</span>
                        {portfolioUrl && (
                            <a
                                href={portfolioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium"
                            >
                                Xem portfolio →
                            </a>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground mb-5 leading-relaxed whitespace-pre-wrap">
                        {product.description}
                    </p>

                    {/* Project link */}
                    {product.link && (
                        <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium mb-5"
                        >
                            🔗 Xem dự án
                        </a>
                    )}

                    {/* Attachments */}
                    {product.files?.length > 0 && (
                        <div className="mb-5">
                            <p className="text-sm font-medium mb-2">📎 Tệp đính kèm:</p>
                            <div className="space-y-2">
                                {product.files.map((f) => (
                                    <div key={f.publicId} className="flex items-center gap-2">
                                        <span className="text-lg">
                                            {f.fileType === 'image' ? '🖼️' : f.fileType === 'video' ? '🎥' : '📄'}
                                        </span>
                                        <span className="flex-1 text-sm truncate text-muted-foreground">
                                            {f.filename}
                                        </span>
                                        <a
                                            href={getFileHref(f.url, f.filename, f.fileType)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={f.fileType === 'document' ? f.filename : undefined}
                                            className="flex-shrink-0 px-3 py-1 bg-muted hover:bg-muted/80 text-foreground text-xs rounded-lg font-medium"
                                        >
                                            ⬇ Tải xuống
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex gap-3 pt-2 border-t border-border mt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm"
                        >
                            Đóng
                        </button>
                        {portfolioUrl && (
                            <a
                                href={portfolioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium text-center"
                            >
                                → Xem portfolio học viên
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/showcase/page.tsx
git commit -m "feat(showcase): add ProductDetailModal component with file download and portfolio link"
```

---

### Task 3: Wire modal into `ShowcasePage` and connect cards

**Files:**
- Modify: `frontend/src/app/showcase/page.tsx`

- [ ] **Step 1: Add `selectedProduct` state to `ShowcasePage`**

Inside `ShowcasePage`, add after the existing `useState` declarations:

```typescript
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
```

- [ ] **Step 2: Pass `onClick` to `FeaturedCard` instances**

In the featured section, update the map:

```typescript
{data.featured.map((product) => (
    <FeaturedCard
        key={product._id}
        product={product}
        onClick={() => setSelectedProduct(product)}
    />
))}
```

- [ ] **Step 3: Pass `onClick` to `ProductCard` instances**

In the others section, update the map:

```typescript
{data.others.map((product) => (
    <ProductCard
        key={product._id}
        product={product}
        onClick={() => setSelectedProduct(product)}
    />
))}
```

- [ ] **Step 4: Render `ProductDetailModal` at the bottom of the JSX**

Just before the closing `</div>` of the page root, add:

```typescript
<ProductDetailModal
    product={selectedProduct}
    onClose={() => setSelectedProduct(null)}
/>
```

- [ ] **Step 5: Verify the import — `useEffect` must be imported from React**

Check the top of the file. The import line should read:

```typescript
import { useEffect, useState } from 'react';
```

`useEffect` is needed by `ProductDetailModal`. It is already imported in the original file so no change needed — just verify.

- [ ] **Step 6: Manual smoke test**

With the local dev server running (`npm run dev` in `frontend/`):

1. Open http://localhost:3000/showcase
2. Click any product card → modal opens
3. Verify thumbnail / placeholder renders
4. Verify full description (no truncation)
5. If product has files → click "⬇ Tải xuống" for each type (image, video, document) and verify download works
6. Click "Xem portfolio →" link → opens `/portfolio/:userId` in new tab
7. Click backdrop → modal closes
8. Press Escape → modal closes
9. Click ✕ button → modal closes
10. Click "🔗 Xem dự án" on a card → modal does NOT open (stopPropagation works)

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/showcase/page.tsx
git commit -m "feat(showcase): wire product detail modal into showcase page"
```
