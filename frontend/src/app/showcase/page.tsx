'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product, ShowcaseResponse, User } from '@/types';

function getFileIcon(fileType: 'image' | 'video' | 'document') {
    if (fileType === 'image') return '🖼️';
    if (fileType === 'video') return '🎥';
    return '📄';
}

function getOwnerName(product: Product): string {
    if (product.user && typeof product.user === 'object') {
        return (product.user as any).fullName || '';
    }
    return '';
}

function getUserId(product: Product): string {
    if (product.user && typeof product.user === 'object') {
        return (product.user as User)._id || '';
    }
    return typeof product.user === 'string' ? product.user : '';
}

function getFileHref(url: string, filename: string, fileType: 'image' | 'video' | 'document'): string {
    if (fileType !== 'document') return url;
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return url.replace('/upload/', `/upload/fl_attachment:${safe}/`);
}

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

function ProductDetailModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
    useEffect(() => {
        if (!product) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
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
                                            {getFileIcon(f.fileType)}
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

export default function ShowcasePage() {
    const [data, setData] = useState<ShowcaseResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchShowcase();
    }, [selectedStudent]);

    const fetchShowcase = async () => {
        try {
            setLoading(true);
            const result = await api.getShowcase(selectedStudent || undefined) as ShowcaseResponse;
            setData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const totalProducts = data ? data.featured.length + data.others.length : null;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 py-8">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        {/* Left: title */}
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🎨</span>
                            <div>
                                <h1 className="text-2xl font-bold text-white leading-tight">Sản phẩm của học viên</h1>
                                <p className="text-white/70 text-sm mt-0.5">Khám phá các dự án sáng tạo từ khóa học AI</p>
                            </div>
                        </div>
                        {/* Right: stats */}
                        <div className="flex items-center gap-3">
                            <div className="bg-white/15 rounded-xl px-4 py-2 text-white text-center min-w-[72px]">
                                <div className="text-xl font-bold">{data?.students.length ?? '—'}</div>
                                <div className="text-xs text-white/70">🎓 Học viên</div>
                            </div>
                            <div className="bg-white/15 rounded-xl px-4 py-2 text-white text-center min-w-[72px]">
                                <div className="text-xl font-bold">{totalProducts ?? '—'}</div>
                                <div className="text-xs text-white/70">📦 Sản phẩm</div>
                            </div>
                            <div className="bg-white/15 rounded-xl px-4 py-2 text-white text-center min-w-[72px]">
                                <div className="text-xl font-bold">{data?.featured.length ?? '—'}</div>
                                <div className="text-xs text-white/70">⭐ Nổi bật</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* Featured Section */}
                        {data?.featured && data.featured.length > 0 && (
                            <section className="mb-12">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="text-2xl">⭐</span>
                                    <h2 className="text-2xl font-bold">Nổi bật</h2>
                                </div>
                                <div className="space-y-4">
                                    {data.featured.map((product) => (
                                        <FeaturedCard key={product._id} product={product} onClick={() => setSelectedProduct(product)} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* All Products Section */}
                        <section>
                            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                                <h2 className="text-2xl font-bold">Tất cả sản phẩm</h2>
                                {data?.students && data.students.length > 0 && (
                                    <select
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        className="px-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Tất cả học viên</option>
                                        {data.students.map((s) => (
                                            <option key={s._id} value={s._id}>
                                                {s.fullName}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {data?.others && data.others.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {data.others.map((product) => (
                                        <ProductCard key={product._id} product={product} onClick={() => setSelectedProduct(product)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-card rounded-2xl border border-border">
                                    <div className="text-5xl mb-4">📦</div>
                                    <p className="text-muted-foreground">Chưa có sản phẩm nào</p>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
            <ProductDetailModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
}
