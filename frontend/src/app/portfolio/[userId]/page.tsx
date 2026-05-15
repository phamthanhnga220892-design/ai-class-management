'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

interface ProductFile {
    publicId: string;
    url: string;
    filename: string;
    fileType: 'image' | 'video' | 'document';
}

interface Product {
    _id: string;
    title: string;
    description: string;
    link?: string;
    files: ProductFile[];
}

interface PortfolioData {
    user: {
        _id: string;
        fullName: string;
        email: string;
    } | null;
    products: Product[];
}

const FILE_ICONS: Record<ProductFile['fileType'], string> = {
    image: '🖼️',
    video: '🎥',
    document: '📄',
};

function getFileHref(url: string, filename: string, fileType: ProductFile['fileType']): string {
    if (fileType !== 'document') return url;
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return url.replace('/upload/', `/upload/fl_attachment:${safe}/`);
}

export default function PublicPortfolioPage() {
    const params = useParams();
    const userId = params.userId as string;
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPortfolio();
    }, [userId]);

    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            const data = await api.getPublicPortfolio(userId);
            setPortfolio(data as PortfolioData);
        } catch (err: any) {
            setError(err.message || 'Không thể tải portfolio');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-lg">Đang tải portfolio...</p>
                </div>
            </div>
        );
    }

    if (error || !portfolio) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold mb-2">Không tìm thấy portfolio</h1>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Portfolio Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-border">
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-lg">
                            {portfolio.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <h1 className="text-4xl font-bold mb-2">
                            {portfolio.user?.fullName || 'Học viên'}
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            {portfolio.products.length} sản phẩm
                        </p>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="container mx-auto px-4 py-12">
                {portfolio.products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-6">📦</div>
                        <h3 className="text-3xl font-semibold mb-3">Chưa có sản phẩm nào</h3>
                        <p className="text-muted-foreground text-lg">
                            Học viên chưa thêm sản phẩm vào portfolio
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {portfolio.products.map((product) => (
                            <div
                                key={product._id}
                                className="bg-white rounded-2xl border border-border p-6 hover:shadow-2xl transition-all hover:-translate-y-2 duration-300"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="text-4xl">🎨</div>
                                    <h3 className="text-xl font-bold flex-1 leading-tight">{product.title}</h3>
                                </div>
                                <p className="text-muted-foreground mb-6 leading-relaxed min-h-[4rem]">
                                    {product.description}
                                </p>

                                {product.link && (
                                    <a
                                        href={product.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium mb-4"
                                    >
                                        <span>Xem sản phẩm</span>
                                        <span>→</span>
                                    </a>
                                )}

                                {product.files?.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs text-muted-foreground mb-2">📎 Tệp đính kèm:</p>
                                        <div className="space-y-1">
                                            {product.files.map((f) => (
                                                <a
                                                    key={f.publicId}
                                                    href={getFileHref(f.url, f.filename, f.fileType)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download={f.fileType === 'document' ? f.filename : undefined}
                                                    className="flex items-center gap-2 text-sm hover:text-primary truncate"
                                                >
                                                    <span>{FILE_ICONS[f.fileType]}</span>
                                                    <span className="truncate">{f.filename}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-white/80 backdrop-blur-sm mt-20">
                <div className="container mx-auto px-4 py-8 text-center">
                    <p className="text-muted-foreground">
                        Portfolio được tạo bởi <span className="font-semibold text-primary">AI Academy</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
