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

export default function ShowcasePage() {
    const [data, setData] = useState<ShowcaseResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState('');

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

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-3">Sản phẩm của học viên</h1>
                    <p className="text-muted-foreground text-lg">
                        Khám phá các dự án được tạo ra trong khóa học AI
                    </p>
                </div>

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
                                        <FeaturedCard key={product._id} product={product} onClick={() => {}} />
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
                                        <ProductCard key={product._id} product={product} onClick={() => {}} />
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
        </div>
    );
}
