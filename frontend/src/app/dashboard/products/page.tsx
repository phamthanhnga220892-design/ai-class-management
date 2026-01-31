'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Product {
    _id: string;
    title: string;
    description: string;
    link: string;
    createdAt: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({ title: '', description: '', link: '' });
    const [error, setError] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        fetchProducts();
        // Get user ID for share link
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
            try {
                const user = JSON.parse(userInfo);
                // Use userId field from JWT payload, not _id
                setUserId(user.userId || user._id || user.sub);
            } catch (e) {
                console.error('Failed to parse user info:', e);
            }
        }
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getMyProducts();
            setProducts(data as Product[]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.updateProduct(editingProduct._id, formData);
            } else {
                await api.createProduct(formData);
            }
            setShowModal(false);
            setFormData({ title: '', description: '', link: '' });
            setEditingProduct(null);
            fetchProducts();
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            description: product.description,
            link: product.link,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
        try {
            await api.deleteProduct(id);
            fetchProducts();
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra');
        }
    };

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/portfolio/${userId}`;
        navigator.clipboard.writeText(shareUrl);
        alert('Đã copy link portfolio!');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Sản phẩm của tôi</h1>
                <div className="flex gap-3">
                    <button
                        onClick={handleShare}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        🔗 Chia sẻ Portfolio
                    </button>
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setFormData({ title: '', description: '', link: '' });
                            setShowModal(true);
                        }}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                        + Thêm sản phẩm
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {products.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl border border-border">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold mb-2">Chưa có sản phẩm nào</h3>
                    <p className="text-muted-foreground mb-6">
                        Hãy thêm sản phẩm đầu tiên của bạn!
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                        Thêm sản phẩm đầu tiên
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
                        >
                            <h3 className="text-xl font-bold mb-3">{product.title}</h3>
                            <p className="text-muted-foreground mb-4 line-clamp-3">
                                {product.description}
                            </p>
                            <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm mb-4 block truncate"
                            >
                                🔗 {product.link}
                            </a>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    ✏️ Sửa
                                </button>
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                >
                                    🗑️ Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tên sản phẩm *
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={200}
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Mô tả sản phẩm *
                                </label>
                                <textarea
                                    required
                                    maxLength={1000}
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Link sản phẩm *
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={formData.link}
                                    onChange={(e) =>
                                        setFormData({ ...formData, link: e.target.value })
                                    }
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingProduct(null);
                                        setFormData({ title: '', description: '', link: '' });
                                    }}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                                >
                                    {editingProduct ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
