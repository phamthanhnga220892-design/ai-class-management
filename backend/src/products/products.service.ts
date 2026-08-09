import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductFile, ProductThumbnail } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminCreateProductDto } from './dto/admin-create-product.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class ProductsService {
    private static readonly MAX_FILES = 5;

    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
        private cloudinaryService: CloudinaryService,
    ) {}

    async getMyProducts(userId: string): Promise<Product[]> {
        return this.productModel.find({ user: userId }).sort({ createdAt: -1 }).lean().exec();
    }

    async getPublicPortfolio(userId: string): Promise<{ user: any; products: Product[] }> {
        const products = await this.productModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('user', 'fullName email')
            .lean()
            .exec();

        let userInfo: any = null;
        if (products.length > 0) {
            userInfo = products[0].user;
        } else {
            const User = this.productModel.db.model('User');
            userInfo = await User.findById(userId).select('fullName email').lean().exec();
        }

        return { user: userInfo, products };
    }

    async getShowcase(userId?: string): Promise<{
        featured: Product[];
        others: Product[];
        students: { _id: string; fullName: string }[];
    }> {
        const othersQuery: any = { isFeatured: false };
        if (userId) othersQuery.user = userId;

        const [featured, others, studentsWithProducts] = await Promise.all([
            this.productModel
                .find({ isFeatured: true })
                .populate('user', 'fullName email')
                .sort({ createdAt: -1 })
                .lean()
                .exec(),
            this.productModel
                .find(othersQuery)
                .populate('user', 'fullName email')
                .sort({ createdAt: -1 })
                .lean()
                .exec(),
            this.productModel.aggregate([
                { $group: { _id: '$user' } },
                { $addFields: { userObjId: { $toObjectId: '$_id' } } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userObjId',
                        foreignField: '_id',
                        as: 'userInfo',
                    },
                },
                { $unwind: '$userInfo' },
                { $project: { _id: 1, fullName: '$userInfo.fullName' } },
                { $sort: { fullName: 1 } },
            ]),
        ]);

        return { featured, others, students: studentsWithProducts };
    }

    async adminGetAll(userId?: string): Promise<Product[]> {
        const query: any = {};
        if (userId) query.user = userId;
        return this.productModel
            .find(query)
            .populate('user', 'fullName email')
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    async create(
        userId: string,
        createProductDto: CreateProductDto,
        files: Express.Multer.File[],
        thumbnailFile?: Express.Multer.File,
    ): Promise<Product> {
        if (files.length > ProductsService.MAX_FILES) {
            throw new BadRequestException(`Tối đa ${ProductsService.MAX_FILES} file cho mỗi sản phẩm`);
        }

        const uploadedFiles = await Promise.all(
            files.map((f) => this.cloudinaryService.uploadFile(f.buffer, f.originalname, f.mimetype)),
        );

        let thumbnail: ProductThumbnail | null = null;
        if (thumbnailFile) {
            thumbnail = await this.cloudinaryService.uploadThumbnail(thumbnailFile.buffer);
        }

        const product = new this.productModel({
            ...createProductDto,
            user: userId,
            files: uploadedFiles,
            thumbnail,
        });
        return product.save();
    }

    async adminCreate(
        adminId: string,
        dto: AdminCreateProductDto,
        files: Express.Multer.File[],
        thumbnailFile?: Express.Multer.File,
    ): Promise<Product> {
        if (files.length > ProductsService.MAX_FILES) {
            throw new BadRequestException(`Tối đa ${ProductsService.MAX_FILES} file cho mỗi sản phẩm`);
        }

        const targetUser = await this.productModel.db.model('User').findById(dto.targetUserId).lean().exec();
        if (!targetUser) {
            throw new NotFoundException('Không tìm thấy học viên');
        }

        const uploadedFiles = await Promise.all(
            files.map((f) => this.cloudinaryService.uploadFile(f.buffer, f.originalname, f.mimetype)),
        );

        let thumbnail: ProductThumbnail | null = null;
        if (thumbnailFile) {
            thumbnail = await this.cloudinaryService.uploadThumbnail(thumbnailFile.buffer);
        }

        const { targetUserId, ...productFields } = dto;
        const product = new this.productModel({
            ...productFields,
            user: targetUserId,
            createdBy: adminId,
            files: uploadedFiles,
            thumbnail,
        });
        return product.save();
    }

    async toggleFeatured(productId: string): Promise<Product> {
        const product = await this.productModel.findById(productId).exec();
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
        product.isFeatured = !product.isFeatured;
        return product.save();
    }

    async update(
        userId: string,
        userRole: UserRole,
        productId: string,
        updateProductDto: UpdateProductDto,
        newFiles: Express.Multer.File[],
        thumbnailFile?: Express.Multer.File,
        deleteThumbnail?: boolean,
    ): Promise<Product> {
        const product = await this.productModel.findById(productId).exec();
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

        const isOwner = product.user.toString() === userId;
        const isAdmin = userRole === UserRole.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException('Bạn không có quyền chỉnh sửa sản phẩm này');
        }

        const { targetUserId } = updateProductDto;
        if (targetUserId && !isAdmin) {
            throw new ForbiddenException('Bạn không có quyền đổi chủ sở hữu sản phẩm');
        }
        // Kiểm tra trước khi upload để không bỏ lại file rác trên Cloudinary nếu user đích không tồn tại.
        if (targetUserId) {
            const newOwner = await this.productModel.db.model('User').findById(targetUserId).lean().exec();
            if (!newOwner) throw new NotFoundException('Không tìm thấy học viên');
        }

        const deleteFileIds: string[] = Array.isArray(updateProductDto.deleteFileIds)
            ? updateProductDto.deleteFileIds
            : updateProductDto.deleteFileIds
              ? [updateProductDto.deleteFileIds]
              : [];

        const remainingFiles = product.files.filter((f) => !deleteFileIds.includes(f.publicId));

        if (remainingFiles.length + newFiles.length > ProductsService.MAX_FILES) {
            throw new BadRequestException(`Tối đa ${ProductsService.MAX_FILES} file cho mỗi sản phẩm`);
        }

        if (deleteFileIds.length > 0) {
            const toDelete = product.files.filter((f) => deleteFileIds.includes(f.publicId));
            await Promise.allSettled(
                toDelete.map((f) => this.cloudinaryService.deleteFile(f.publicId, f.fileType)),
            );
        }

        if (deleteThumbnail && product.thumbnail) {
            await this.cloudinaryService.deleteThumbnail(product.thumbnail.publicId);
            product.thumbnail = null;
        }

        if (thumbnailFile) {
            if (product.thumbnail) {
                await this.cloudinaryService.deleteThumbnail(product.thumbnail.publicId);
            }
            product.thumbnail = await this.cloudinaryService.uploadThumbnail(thumbnailFile.buffer);
        }

        const uploadedFiles = await Promise.all(
            newFiles.map((f) => this.cloudinaryService.uploadFile(f.buffer, f.originalname, f.mimetype)),
        );

        const {
            deleteFileIds: _removed,
            deleteThumbnail: _dt,
            targetUserId: _target,
            ...fieldsToUpdate
        } = updateProductDto as any;
        Object.assign(product, fieldsToUpdate);
        if (targetUserId) {
            // `user` là Mixed path (schema khai `Types.ObjectId` — class BSON — thay vì
            // `Schema.Types.ObjectId`), nên mongoose không cast gì cả. create()/adminCreate()
            // lưu string, và các query lọc theo user cũng so bằng string. Lưu ObjectId ở đây
            // sẽ khiến sản phẩm biến mất khỏi dashboard và portfolio của chủ mới.
            product.user = targetUserId as any;
        }
        product.files = [...remainingFiles, ...uploadedFiles] as ProductFile[];
        return product.save();
    }

    async delete(userId: string, userRole: UserRole, productId: string): Promise<void> {
        const product = await this.productModel.findById(productId).exec();
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

        const isOwner = product.user.toString() === userId;
        const isAdmin = userRole === UserRole.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException('Bạn không có quyền xóa sản phẩm này');
        }

        await Promise.allSettled(
            product.files.map((f) => this.cloudinaryService.deleteFile(f.publicId, f.fileType)),
        );

        if (product.thumbnail) {
            await this.cloudinaryService.deleteThumbnail(product.thumbnail.publicId);
        }

        await this.productModel.findByIdAndDelete(productId).exec();
    }
}
