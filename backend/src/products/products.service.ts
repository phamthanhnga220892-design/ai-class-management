import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
        const featured = await this.productModel
            .find({ isFeatured: true })
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const othersQuery: any = { isFeatured: false };
        if (userId) othersQuery.user = userId;

        const others = await this.productModel
            .find(othersQuery)
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const studentsWithProducts = await this.productModel.aggregate([
            { $group: { _id: '$user' } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo',
                },
            },
            { $unwind: '$userInfo' },
            { $project: { _id: 1, fullName: '$userInfo.fullName' } },
            { $sort: { fullName: 1 } },
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

        const { deleteFileIds: _removed, ...fieldsToUpdate } = updateProductDto as any;
        Object.assign(product, fieldsToUpdate);
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
