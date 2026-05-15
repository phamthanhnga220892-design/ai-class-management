'use client';

import { useEffect, useRef, useState } from 'react';
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
    createdAt: string;
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

const ACCEPTED_TYPES = 'image/*,video/*,application/pdf,.ppt,.pptx';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 5;

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [existingFiles, setExistingFiles] = useState<ProductFile[]>([]);
    const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [fileError, setFileError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    useEffect(() => {
        fetchProducts();
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
            try {
                const user = JSON.parse(userInfo);
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

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setLink('');
        setExistingFiles([]);
        setPendingDeleteIds([]);
        setNewFiles([]);
        setFileError('');
        setEditingProduct(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setTitle(product.title);
        setDescription(product.description);
        setLink(product.link || '');
        setExistingFiles(product.files || []);
        setPendingDeleteIds([]);
        setNewFiles([]);
        setFileError('');
        setShowModal(true);
    };

    const totalFileCount = () =>
        existingFiles.filter((f) => !pendingDeleteIds.includes(f.publicId)).length + newFiles.length;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError('');
        const selected = Array.from(e.target.files || []);
        if (!selected.length) return;

        const oversized = selected.find((f) => f.size > MAX_FILE_SIZE);
        if (oversized) {
            setFileError('File vượt quá giới hạn 50MB');
            e.target.value = '';
            return;
        }

        if (totalFileCount() + selected.length > MAX_FILES) {
            setFileError(`Chỉ được tải lên tối đa ${MAX_FILES} file`);
            e.target.value = '';
            return;
        }

        setNewFiles((prev) => [...prev, ...selected]);
        e.target.value = '';
    };

    const removeNewFile = (index: number) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
        setFileError('');
    };

    const toggleDeleteExisting = (publicId: string) => {
        setPendingDeleteIds((prev) =>
            prev.includes(publicId) ? prev.filter((id) => id !== publicId) : [...prev, publicId],
        );
        setFileError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingProduct) {
                await api.updateProduct(editingProduct._id, {
                    title,
                    description,
                    link: link || undefined,
                    files: newFiles,
                    deleteFileIds: pendingDeleteIds,
                });
            } else {
                await api.createProduct({ title, description, link: link || undefined, files: newFiles });
            }
            setShowModal(false);
            resetForm();
            fetchProducts();
            showSuccess(editingProduct ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
        try {
            await api.deleteProduct(id);
            fetchProducts();
            showSuccess('Xóa sản phẩm thành công!');
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
                        onClick={openAddModal}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                        + Thêm sản phẩm
                    </button>
                </div>
            </div>

            {successMsg && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
                    ✅ {successMsg}
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {products.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl border border-border">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold mb-2">Chưa có sản phẩm nào</h3>
                    <p className="text-muted-foreground mb-6">Hãy thêm sản phẩm đầu tiên của bạn!</p>
                    <button
                        onClick={openAddModal}
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
                            <p className="text-muted-foreground mb-4 line-clamp-3">{product.description}</p>

                            {product.link && (
                                <a
                                    href={product.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm mb-4 block truncate"
                                >
                                    🔗 {product.link}
                                </a>
                            )}

                            {product.files?.length > 0 && (
                                <div className="mt-3 mb-4">
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

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => openEditModal(product)}
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
                    <div className="bg-card rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Tên */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Tên sản phẩm *</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={200}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                />
                            </div>

                            {/* Nội dung */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Nội dung *</label>
                                <textarea
                                    required
                                    maxLength={1000}
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                />
                            </div>

                            {/* Link */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Link sản phẩm <span className="text-muted-foreground font-normal">(không bắt buộc)</span>
                                </label>
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                />
                            </div>

                            {/* File upload */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    File đính kèm{' '}
                                    <span className="text-muted-foreground font-normal">
                                        (tối đa {MAX_FILES} file, mỗi file max 50MB)
                                    </span>
                                </label>

                                {totalFileCount() < MAX_FILES && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary hover:bg-primary/5 transition-colors"
                                    >
                                        <div className="text-2xl mb-1">📎</div>
                                        <div className="text-sm text-muted-foreground">
                                            Chọn file hoặc kéo thả
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Ảnh, PPT, PDF, Video • Tối đa 50MB
                                        </div>
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept={ACCEPTED_TYPES}
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />

                                {fileError && (
                                    <p className="text-red-600 text-sm mt-2">{fileError}</p>
                                )}

                                {/* Files đã có trên server (edit mode) */}
                                {existingFiles.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {existingFiles.map((f) => {
                                            const isDeleting = pendingDeleteIds.includes(f.publicId);
                                            return (
                                                <div
                                                    key={f.publicId}
                                                    className="flex items-center gap-2 text-sm"
                                                >
                                                    <span>{FILE_ICONS[f.fileType]}</span>
                                                    <span className={`flex-1 truncate ${isDeleting ? 'line-through text-muted-foreground' : ''}`}>
                                                        {f.filename}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleDeleteExisting(f.publicId)}
                                                        className={`text-xs px-2 py-0.5 rounded ${
                                                            isDeleting
                                                                ? 'bg-muted text-muted-foreground'
                                                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        {isDeleting ? 'Hoàn tác' : 'Xóa'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Files mới chọn (chưa upload) */}
                                {newFiles.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {newFiles.map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                <span>📎</span>
                                                <span className="flex-1 truncate text-blue-600">{f.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewFile(i)}
                                                    className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {submitting ? 'Đang lưu...' : editingProduct ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
