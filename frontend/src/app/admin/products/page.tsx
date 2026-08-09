'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Product, ProductFile } from '@/types';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_TYPES = 'image/*,video/*,application/pdf,.ppt,.pptx';

const FILE_ICONS: Record<ProductFile['fileType'], string> = {
    image: '🖼️',
    video: '🎥',
    document: '📄',
};

function getOwnerName(product: Product): string {
    if (product.user && typeof product.user === 'object') {
        return (product.user as any).fullName || '';
    }
    return '';
}

/**
 * Chủ đã bị xóa thì populate trả về null — mà `typeof null === 'object'`,
 * nên phải kiểm tra null trước khi đọc `_id`.
 */
function getOwnerId(product: Product): string {
    if (!product.user) return '';
    if (typeof product.user === 'object') return (product.user as any)._id || '';
    return product.user;
}

function isAdminCreated(product: Product): boolean {
    return !!product.createdBy;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [students, setStudents] = useState<{ _id: string; fullName: string }[]>([]);
    const [filterStudentId, setFilterStudentId] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [successMsg, setSuccessMsg] = useState('');

    // Form state
    const [targetUserId, setTargetUserId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [existingThumbnail, setExistingThumbnail] = useState<{ publicId: string; url: string } | null>(null);
    const [deleteThumbnail, setDeleteThumbnail] = useState(false);
    const [existingFiles, setExistingFiles] = useState<ProductFile[]>([]);
    const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [fileError, setFileError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [filterStudentId]);

    const fetchStudents = async () => {
        try {
            const data = await api.adminGetStudents() as { _id: string; fullName: string }[];
            setStudents(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await api.adminGetProducts(filterStudentId || undefined) as Product[];
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTargetUserId('');
        setTitle('');
        setDescription('');
        setLink('');
        setIsFeatured(false);
        setThumbnail(null);
        setThumbnailPreview(null);
        setExistingThumbnail(null);
        setDeleteThumbnail(false);
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
        setTargetUserId(getOwnerId(product));
        setTitle(product.title);
        setDescription(product.description);
        setLink(product.link || '');
        setIsFeatured(product.isFeatured);
        setThumbnail(null);
        setThumbnailPreview(null);
        setExistingThumbnail(product.thumbnail || null);
        setDeleteThumbnail(false);
        setExistingFiles(product.files || []);
        setPendingDeleteIds([]);
        setNewFiles([]);
        setFileError('');
        setShowModal(true);
    };

    /**
     * Danh sách chọn chủ sở hữu. `students` chỉ gồm học viên đang hoạt động, nên nếu
     * chủ hiện tại không nằm trong đó (tài khoản đã tắt, hoặc chủ là admin) thì phải
     * chèn thêm — không thì select rơi về rỗng và dễ gán nhầm sang người khác.
     */
    const ownerOptions = () => {
        if (!editingProduct) return students;
        const ownerId = getOwnerId(editingProduct);
        if (!ownerId || students.some((s) => s._id === ownerId)) return students;
        return [
            { _id: ownerId, fullName: getOwnerName(editingProduct) || 'Chủ sở hữu hiện tại' },
            ...students,
        ];
    };

    const totalFileCount = () =>
        existingFiles.filter((f) => !pendingDeleteIds.includes(f.publicId)).length + newFiles.length;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError('');
        const selected = Array.from(e.target.files || []);
        if (!selected.length) return;
        if (selected.find((f) => f.size > MAX_FILE_SIZE)) {
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

    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Ảnh đại diện phải là file ảnh');
            return;
        }
        setThumbnail(file);
        setThumbnailPreview(URL.createObjectURL(file));
        setDeleteThumbnail(false);
        e.target.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingProduct) {
                await api.updateProduct(editingProduct._id, {
                    // Chỉ gửi khi thực sự đổi chủ, tránh ghi đè thừa.
                    targetUserId: targetUserId !== getOwnerId(editingProduct) ? targetUserId : undefined,
                    title,
                    description,
                    link: link || undefined,
                    files: newFiles,
                    deleteFileIds: pendingDeleteIds,
                    thumbnail: thumbnail || undefined,
                    deleteThumbnail,
                });
            } else {
                await api.adminCreateProduct({
                    targetUserId,
                    title,
                    description,
                    link: link || undefined,
                    files: newFiles,
                    thumbnail,
                    isFeatured,
                });
            }
            setShowModal(false);
            resetForm();
            fetchProducts();
            showSuccess(editingProduct ? 'Cập nhật thành công!' : 'Tạo sản phẩm thành công!');
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa sản phẩm này?')) return;
        try {
            await api.deleteProduct(id);
            fetchProducts();
            showSuccess('Đã xóa sản phẩm');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleToggleFeatured = async (id: string) => {
        try {
            await api.adminToggleFeatured(id);
            setProducts((prev) =>
                prev.map((p) => (p._id === id ? { ...p, isFeatured: !p.isFeatured } : p)),
            );
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Sản phẩm học viên</h1>
                <button
                    onClick={openAddModal}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
                >
                    + Tạo sản phẩm
                </button>
            </div>

            {successMsg && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-5 py-3 rounded-lg shadow-lg">
                    ✅ {successMsg}
                </div>
            )}

            {/* Filter */}
            <div className="mb-6">
                <select
                    value={filterStudentId}
                    onChange={(e) => setFilterStudentId(e.target.value)}
                    className="px-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">Tất cả học viên</option>
                    {students.map((s) => (
                        <option key={s._id} value={s._id}>
                            {s.fullName}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl border border-border">
                    <div className="text-5xl mb-4">📦</div>
                    <p className="text-muted-foreground">Chưa có sản phẩm nào</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product._id} className="bg-card border border-border rounded-xl overflow-hidden">
                            {product.thumbnail && (
                                <img
                                    src={product.thumbnail.url}
                                    alt={product.title}
                                    className="w-full h-40 object-cover"
                                />
                            )}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-bold truncate">{product.title}</h3>
                                    <button
                                        onClick={() => handleToggleFeatured(product._id)}
                                        title={product.isFeatured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                                        className="text-xl flex-shrink-0 hover:scale-110 transition-transform"
                                    >
                                        {product.isFeatured ? '⭐' : '☆'}
                                    </button>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">👤 {getOwnerName(product)}</p>
                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                                <div className="flex gap-1 flex-wrap mb-3">
                                    {product.isFeatured && (
                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                            ⭐ Nổi bật
                                        </span>
                                    )}
                                    {isAdminCreated(product) && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                            Admin tạo
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"
                                    >
                                        ✏️ Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product._id)}
                                        className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs"
                                    >
                                        🗑 Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingProduct ? 'Sửa sản phẩm' : 'Tạo sản phẩm cho học viên'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Chọn học viên */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Học viên *</label>
                                <select
                                    required
                                    value={targetUserId}
                                    onChange={(e) => setTargetUserId(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                                >
                                    <option value="">Chọn học viên...</option>
                                    {ownerOptions().map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tiêu đề */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Tên sản phẩm *</label>
                                <input
                                    type="text" required maxLength={200}
                                    value={title} onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Mô tả */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Mô tả *</label>
                                <textarea
                                    required maxLength={1000} rows={3}
                                    value={description} onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Link */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Link <span className="text-muted-foreground font-normal">(không bắt buộc)</span>
                                </label>
                                <input
                                    type="url" value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Ảnh đại diện */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Ảnh đại diện</label>
                                {(thumbnailPreview || (existingThumbnail && !deleteThumbnail)) ? (
                                    <div className="relative">
                                        <img
                                            src={thumbnailPreview || existingThumbnail?.url}
                                            alt="preview"
                                            className="w-full h-40 object-cover rounded-lg border border-border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setThumbnail(null);
                                                setThumbnailPreview(null);
                                                if (existingThumbnail) setDeleteThumbnail(true);
                                            }}
                                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                                        >✕</button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => thumbnailInputRef.current?.click()}
                                        className="w-full border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary hover:bg-primary/5 transition-colors"
                                    >
                                        <div className="text-2xl mb-1">🖼️</div>
                                        <div className="text-sm text-muted-foreground">Chọn ảnh đại diện</div>
                                    </button>
                                )}
                                <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailSelect} />
                            </div>

                            {/* File đính kèm */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    File đính kèm <span className="text-muted-foreground font-normal">(tối đa {MAX_FILES} file)</span>
                                </label>
                                {totalFileCount() < MAX_FILES && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full border-2 border-dashed border-border rounded-lg p-3 text-center hover:border-primary hover:bg-primary/5 transition-colors"
                                    >
                                        <div className="text-sm text-muted-foreground">📎 Chọn file hoặc kéo thả</div>
                                    </button>
                                )}
                                <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_TYPES} className="hidden" onChange={handleFileSelect} />
                                {fileError && <p className="text-red-600 text-sm mt-1">{fileError}</p>}
                                {existingFiles.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {existingFiles.map((f) => {
                                            const isDeleting = pendingDeleteIds.includes(f.publicId);
                                            return (
                                                <div key={f.publicId} className="flex items-center gap-2 text-sm">
                                                    <span>{FILE_ICONS[f.fileType]}</span>
                                                    <span className={`flex-1 truncate ${isDeleting ? 'line-through text-muted-foreground' : ''}`}>{f.filename}</span>
                                                    <button type="button"
                                                        onClick={() => setPendingDeleteIds((prev) => isDeleting ? prev.filter((id) => id !== f.publicId) : [...prev, f.publicId])}
                                                        className={`text-xs px-2 py-0.5 rounded ${isDeleting ? 'bg-muted text-muted-foreground' : 'bg-red-100 text-red-600'}`}>
                                                        {isDeleting ? 'Hoàn tác' : 'Xóa'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {newFiles.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {newFiles.map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                <span>📎</span>
                                                <span className="flex-1 truncate text-blue-600">{f.name}</span>
                                                <button type="button" onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                                                    className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600">Xóa</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Nổi bật (chỉ khi tạo mới) */}
                            {!editingProduct && (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox" id="isFeatured"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="isFeatured" className="text-sm font-medium cursor-pointer">
                                        ⭐ Đánh dấu nổi bật
                                    </label>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted" disabled={submitting}>
                                    Hủy
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
                                    {submitting ? 'Đang lưu...' : editingProduct ? 'Cập nhật' : 'Tạo sản phẩm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
