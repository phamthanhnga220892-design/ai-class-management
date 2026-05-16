# Admin Products Management & Public Showcase — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép admin tạo sản phẩm thay học viên và xem/quản lý toàn bộ sản phẩm; thêm trang Showcase công khai hiển thị sản phẩm nổi bật và tất cả sản phẩm theo học viên.

**Architecture:** Backend NestJS bổ sung 3 field vào Product schema (`thumbnail`, `createdBy`, `isFeatured`), thêm admin controller riêng và endpoint showcase public. Frontend Next.js thêm trang `/showcase` public, trang `/admin/products` và cập nhật form sản phẩm học viên để upload thumbnail.

**Tech Stack:** NestJS 10, Mongoose, Cloudinary, Next.js 16, React 19, TailwindCSS, TypeScript.

---

## File Map

**Backend — sửa đổi:**
- `backend/src/products/schemas/product.schema.ts` — thêm `thumbnail`, `createdBy`, `isFeatured`
- `backend/src/products/products.service.ts` — thêm methods: `adminGetAll`, `adminCreate`, `getShowcase`, `toggleFeatured`; sửa `update`/`delete` cho phép admin
- `backend/src/products/products.controller.ts` — dùng `FileFieldsInterceptor` cho thumbnail+files; thêm route `/showcase`
- `backend/src/products/products.module.ts` — import `UsersModule`, register `AdminProductsController`
- `backend/src/users/users.service.ts` — thêm `findAllStudents()`
- `backend/src/users/users.module.ts` — export `UsersService`

**Backend — tạo mới:**
- `backend/src/products/dto/admin-create-product.dto.ts` — extends `CreateProductDto` + `targetUserId`
- `backend/src/products/admin-products.controller.ts` — routes `/admin/products`

**Frontend — sửa đổi:**
- `frontend/src/types/index.ts` — thêm `ProductFile`, `Product`, `ShowcaseResponse` interfaces
- `frontend/src/lib/api.ts` — thêm admin products + showcase API methods
- `frontend/src/components/layout/Header.tsx` — thêm link "Sản phẩm" → `/showcase`
- `frontend/src/app/dashboard/products/page.tsx` — thêm thumbnail upload
- `frontend/src/app/admin/layout.tsx` — thêm mục "Sản phẩm" vào sidebar

**Frontend — tạo mới:**
- `frontend/src/app/showcase/page.tsx` — trang showcase công khai
- `frontend/src/app/admin/products/page.tsx` — trang admin quản lý sản phẩm

---

## Task 1: Cập nhật Product Schema

**Files:**
- Modify: `backend/src/products/schemas/product.schema.ts`

- [ ] **Step 1: Cập nhật schema**

Thay toàn bộ nội dung file:

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class ProductThumbnail {
    @Prop({ required: true })
    publicId: string;

    @Prop({ required: true })
    url: string;
}

export const ProductThumbnailSchema = SchemaFactory.createForClass(ProductThumbnail);

@Schema({ _id: false })
export class ProductFile {
    @Prop({ required: true })
    publicId: string;

    @Prop({ required: true })
    url: string;

    @Prop({ required: true })
    filename: string;

    @Prop({ required: true, enum: ['image', 'video', 'document'] })
    fileType: 'image' | 'video' | 'document';
}

export const ProductFileSchema = SchemaFactory.createForClass(ProductFile);

@Schema({ timestamps: true })
export class Product extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', default: null })
    createdBy: Types.ObjectId | null;

    @Prop({ required: true, trim: true, maxlength: 200 })
    title: string;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    description: string;

    @Prop({ trim: true })
    link?: string;

    @Prop({ type: ProductThumbnailSchema, default: null })
    thumbnail: ProductThumbnail | null;

    @Prop({ type: [ProductFileSchema], default: [] })
    files: ProductFile[];

    @Prop({ default: false })
    isFeatured: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ user: 1, createdAt: -1 });
ProductSchema.index({ isFeatured: 1, createdAt: -1 });
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/products/schemas/product.schema.ts
git commit -m "feat(products): add thumbnail, createdBy, isFeatured to schema"
```

---

## Task 2: Thêm `uploadThumbnail` vào CloudinaryService

**Files:**
- Modify: `backend/src/cloudinary/cloudinary.service.ts`

- [ ] **Step 1: Thêm method `uploadThumbnail`**

Thêm method sau `uploadFile` trong class `CloudinaryService`:

```typescript
uploadThumbnail(buffer: Buffer, originalname: string): Promise<{ publicId: string; url: string }> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    resource_type: 'image',
                    folder: 'products/thumbnails',
                    use_filename: true,
                    unique_filename: true,
                },
                (error, result) => {
                    if (error || !result) return reject(error ?? new Error('Upload failed'));
                    resolve({ publicId: result.public_id, url: result.secure_url });
                },
            )
            .end(buffer);
    });
}

async deleteThumbnail(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (error) {
        console.error(`Failed to delete thumbnail ${publicId}:`, error);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/cloudinary/cloudinary.service.ts
git commit -m "feat(cloudinary): add uploadThumbnail and deleteThumbnail methods"
```

---

## Task 3: Thêm `findAllStudents` vào UsersService và export

**Files:**
- Modify: `backend/src/users/users.service.ts`
- Modify: `backend/src/users/users.module.ts`

- [ ] **Step 1: Thêm method `findAllStudents` vào UsersService**

Thêm import và method vào `users.service.ts`:

```typescript
// Thêm vào import đầu file (UserRole đã import rồi, giữ nguyên)
```

Thêm method sau `findById`:

```typescript
async findAllStudents(): Promise<UserDocument[]> {
    return this.userModel
        .find({ role: UserRole.STUDENT, isActive: true })
        .select('fullName email')
        .sort({ fullName: 1 })
        .lean()
        .exec();
}
```

- [ ] **Step 2: Export UsersService từ UsersModule**

Sửa `backend/src/users/users.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/users/users.service.ts backend/src/users/users.module.ts
git commit -m "feat(users): add findAllStudents method and export UsersService"
```

---

## Task 4: Tạo DTO cho Admin Create Product

**Files:**
- Create: `backend/src/products/dto/admin-create-product.dto.ts`

- [ ] **Step 1: Tạo file DTO**

```typescript
import { IsString, IsNotEmpty } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class AdminCreateProductDto extends CreateProductDto {
    @IsString()
    @IsNotEmpty()
    targetUserId: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/products/dto/admin-create-product.dto.ts
git commit -m "feat(products): add AdminCreateProductDto with targetUserId"
```

---

## Task 5: Cập nhật ProductsService

**Files:**
- Modify: `backend/src/products/products.service.ts`

- [ ] **Step 1: Thay toàn bộ nội dung ProductsService**

```typescript
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
            thumbnail = await this.cloudinaryService.uploadThumbnail(thumbnailFile.buffer, thumbnailFile.originalname);
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
            thumbnail = await this.cloudinaryService.uploadThumbnail(thumbnailFile.buffer, thumbnailFile.originalname);
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
            product.thumbnail = await this.cloudinaryService.uploadThumbnail(
                thumbnailFile.buffer,
                thumbnailFile.originalname,
            );
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/products/products.service.ts
git commit -m "feat(products): add adminGetAll, adminCreate, getShowcase, toggleFeatured; update update/delete for admin access"
```

---

## Task 6: Cập nhật ProductsController + Tạo AdminProductsController

**Files:**
- Modify: `backend/src/products/products.controller.ts`
- Create: `backend/src/products/admin-products.controller.ts`

- [ ] **Step 1: Cập nhật ProductsController**

Thay toàn bộ `backend/src/products/products.controller.ts`:

```typescript
import {
    Controller, Get, Post, Put, Delete,
    Body, Param, Query, UseGuards, Request,
    UseInterceptors, UploadedFiles,
    BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const MAX_FILES_PER_PRODUCT = 5;

const ALLOWED_MIMETYPES = [
    'image/',
    'video/',
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const multerOptions = {
    storage: memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
        const ok = ALLOWED_MIMETYPES.some((type) =>
            type.endsWith('/') ? file.mimetype.startsWith(type) : file.mimetype === type,
        );
        if (!ok) return cb(new BadRequestException('Định dạng file không được hỗ trợ'), false);
        cb(null, true);
    },
};

const imageOnlyOptions = {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new BadRequestException('Ảnh đại diện phải là file ảnh'), false);
        }
        cb(null, true);
    },
};

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @UseGuards(JwtAuthGuard)
    @Get('my')
    getMyProducts(@Request() req) {
        return this.productsService.getMyProducts(req.user.userId);
    }

    @Get('showcase')
    getShowcase(@Query('userId') userId?: string) {
        return this.productsService.getShowcase(userId);
    }

    @Get('portfolio/:userId')
    getPublicPortfolio(@Param('userId') userId: string) {
        return this.productsService.getPublicPortfolio(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'files', maxCount: MAX_FILES_PER_PRODUCT },
    ], { storage: memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }))
    create(
        @Request() req,
        @Body() createProductDto: CreateProductDto,
        @UploadedFiles() uploadedFiles: { thumbnail?: Express.Multer.File[]; files?: Express.Multer.File[] },
    ) {
        const files = uploadedFiles?.files ?? [];
        const thumbnail = uploadedFiles?.thumbnail?.[0];
        return this.productsService.create(req.user.userId, createProductDto, files, thumbnail);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'files', maxCount: MAX_FILES_PER_PRODUCT },
    ], { storage: memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }))
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
        @UploadedFiles() uploadedFiles: { thumbnail?: Express.Multer.File[]; files?: Express.Multer.File[] },
    ) {
        const files = uploadedFiles?.files ?? [];
        const thumbnail = uploadedFiles?.thumbnail?.[0];
        const deleteThumbnail = (updateProductDto as any).deleteThumbnail === 'true';
        return this.productsService.update(
            req.user.userId,
            req.user.role,
            id,
            updateProductDto,
            files,
            thumbnail,
            deleteThumbnail,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Request() req, @Param('id') id: string) {
        return this.productsService.delete(req.user.userId, req.user.role, id);
    }
}
```

- [ ] **Step 2: Tạo AdminProductsController**

Tạo file `backend/src/products/admin-products.controller.ts`:

```typescript
import {
    Controller, Get, Post, Patch,
    Body, Param, Query, UseGuards, Request,
    UseInterceptors, UploadedFiles,
    BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ProductsService } from './products.service';
import { UsersService } from '../users/users.service';
import { AdminCreateProductDto } from './dto/admin-create-product.dto';

const MAX_FILES_PER_PRODUCT = 5;

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly usersService: UsersService,
    ) {}

    @Get()
    getAll(@Query('userId') userId?: string) {
        return this.productsService.adminGetAll(userId);
    }

    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'files', maxCount: MAX_FILES_PER_PRODUCT },
    ], { storage: memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }))
    adminCreate(
        @Request() req,
        @Body() dto: AdminCreateProductDto,
        @UploadedFiles() uploadedFiles: { thumbnail?: Express.Multer.File[]; files?: Express.Multer.File[] },
    ) {
        const files = uploadedFiles?.files ?? [];
        const thumbnail = uploadedFiles?.thumbnail?.[0];
        return this.productsService.adminCreate(req.user.userId, dto, files, thumbnail);
    }

    @Patch(':id/featured')
    toggleFeatured(@Param('id') id: string) {
        return this.productsService.toggleFeatured(id);
    }

    @Get('students')
    getStudents() {
        return this.usersService.findAllStudents();
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/products/products.controller.ts backend/src/products/admin-products.controller.ts
git commit -m "feat(products): update controller for thumbnail support; add AdminProductsController"
```

---

## Task 7: Cập nhật ProductsModule

**Files:**
- Modify: `backend/src/products/products.module.ts`

- [ ] **Step 1: Cập nhật module**

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { AdminProductsController } from './admin-products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
        CloudinaryModule,
        UsersModule,
    ],
    controllers: [ProductsController, AdminProductsController],
    providers: [ProductsService],
    exports: [ProductsService],
})
export class ProductsModule {}
```

- [ ] **Step 2: Verify backend compiles**

```bash
cd backend && npx nest build 2>&1 | head -30
```

Expected: build thành công, không có lỗi TypeScript.

- [ ] **Step 3: Commit**

```bash
git add backend/src/products/products.module.ts
git commit -m "feat(products): register AdminProductsController and import UsersModule"
```

---

## Task 8: Cập nhật Types Frontend

**Files:**
- Modify: `frontend/src/types/index.ts`

- [ ] **Step 1: Thêm Product types**

Thêm vào cuối file `frontend/src/types/index.ts`:

```typescript
export interface ProductFile {
    publicId: string;
    url: string;
    filename: string;
    fileType: 'image' | 'video' | 'document';
}

export interface ProductThumbnail {
    publicId: string;
    url: string;
}

export interface Product {
    _id: string;
    user: string | User;
    createdBy?: string | User | null;
    title: string;
    description: string;
    link?: string;
    thumbnail?: ProductThumbnail | null;
    files: ProductFile[];
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ShowcaseResponse {
    featured: Product[];
    others: Product[];
    students: { _id: string; fullName: string }[];
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/types/index.ts
git commit -m "feat(types): add Product, ProductFile, ProductThumbnail, ShowcaseResponse types"
```

---

## Task 9: Cập nhật API Client

**Files:**
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 1: Thêm các API methods mới**

Thêm vào object `api` trong `frontend/src/lib/api.ts`, sau phần `deleteProduct`:

```typescript
    // Products - with thumbnail support (update existing)
    createProduct: (data: { title: string; description: string; link?: string; files?: File[]; thumbnail?: File | null }) => {
        const form = new FormData();
        form.append('title', data.title);
        form.append('description', data.description);
        if (data.link) form.append('link', data.link);
        if (data.thumbnail) form.append('thumbnail', data.thumbnail);
        data.files?.forEach((f) => form.append('files', f));
        return fetchApi('/products', { method: 'POST', body: form });
    },
    updateProduct: (
        id: string,
        data: { title?: string; description?: string; link?: string; files?: File[]; deleteFileIds?: string[]; thumbnail?: File | null; deleteThumbnail?: boolean },
    ) => {
        const form = new FormData();
        if (data.title !== undefined) form.append('title', data.title);
        if (data.description !== undefined) form.append('description', data.description);
        if (data.link !== undefined) form.append('link', data.link);
        if (data.thumbnail) form.append('thumbnail', data.thumbnail);
        if (data.deleteThumbnail) form.append('deleteThumbnail', 'true');
        data.files?.forEach((f) => form.append('files', f));
        data.deleteFileIds?.forEach((fileId) => form.append('deleteFileIds', fileId));
        return fetchApi(`/products/${id}`, { method: 'PUT', body: form });
    },

    // Public showcase
    getShowcase: (userId?: string) => {
        const query = userId ? `?userId=${userId}` : '';
        return fetchApi(`/products/showcase${query}`);
    },

    // Admin - Products
    adminGetProducts: (userId?: string) => {
        const query = userId ? `?userId=${userId}` : '';
        return fetchApi(`/admin/products${query}`);
    },
    adminGetStudents: () => fetchApi('/admin/products/students'),
    adminCreateProduct: (data: {
        targetUserId: string;
        title: string;
        description: string;
        link?: string;
        files?: File[];
        thumbnail?: File | null;
        isFeatured?: boolean;
    }) => {
        const form = new FormData();
        form.append('targetUserId', data.targetUserId);
        form.append('title', data.title);
        form.append('description', data.description);
        if (data.link) form.append('link', data.link);
        if (data.thumbnail) form.append('thumbnail', data.thumbnail);
        if (data.isFeatured) form.append('isFeatured', 'true');
        data.files?.forEach((f) => form.append('files', f));
        return fetchApi('/admin/products', { method: 'POST', body: form });
    },
    adminToggleFeatured: (id: string) =>
        fetchApi(`/admin/products/${id}/featured`, { method: 'PATCH' }),
```

**Lưu ý:** Xóa 2 method `createProduct` và `updateProduct` cũ (dòng 145-164 trong file gốc) và thay bằng các method mới ở trên.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat(api): add showcase, adminGetProducts, adminCreateProduct, adminToggleFeatured methods; update createProduct/updateProduct with thumbnail support"
```

---

## Task 10: Thêm link "Sản phẩm" vào Header

**Files:**
- Modify: `frontend/src/components/layout/Header.tsx`

- [ ] **Step 1: Thêm link Sản phẩm vào nav**

Trong `frontend/src/components/layout/Header.tsx`, tìm block `<nav>` và thêm link:

```tsx
<nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
    <Link href="/courses" className="hover:text-primary transition-colors">
        Khóa học
    </Link>
    <Link href="/showcase" className="hover:text-primary transition-colors">
        Sản phẩm
    </Link>
    <Link href="/#mentors" className="hover:text-primary transition-colors">
        Mentor
    </Link>
    <Link href="/#testimonials" className="hover:text-primary transition-colors">
        Cảm nhận
    </Link>
</nav>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/layout/Header.tsx
git commit -m "feat(header): add Sản phẩm nav link pointing to /showcase"
```

---

## Task 11: Thêm Thumbnail Upload vào Student Products Page

**Files:**
- Modify: `frontend/src/app/dashboard/products/page.tsx`

- [ ] **Step 1: Thêm state và ref cho thumbnail**

Trong `ProductsPage`, thêm vào phần state (sau dòng `const fileInputRef`):

```tsx
const [thumbnail, setThumbnail] = useState<File | null>(null);
const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
const [existingThumbnail, setExistingThumbnail] = useState<{ publicId: string; url: string } | null>(null);
const [deleteThumbnail, setDeleteThumbnail] = useState(false);
const thumbnailInputRef = useRef<HTMLInputElement>(null);
```

- [ ] **Step 2: Cập nhật interface Product**

Thay interface `Product` ở đầu file (dùng type từ `@/types` thay vì định nghĩa lại):

```tsx
import { Product, ProductFile } from '@/types';
```

Xóa các interface `ProductFile` và `Product` cũ ở đầu file.

- [ ] **Step 3: Cập nhật `resetForm`**

Thêm vào hàm `resetForm`:

```tsx
const resetForm = () => {
    setTitle('');
    setDescription('');
    setLink('');
    setExistingFiles([]);
    setPendingDeleteIds([]);
    setNewFiles([]);
    setFileError('');
    setEditingProduct(null);
    setThumbnail(null);
    setThumbnailPreview(null);
    setExistingThumbnail(null);
    setDeleteThumbnail(false);
};
```

- [ ] **Step 4: Cập nhật `openEditModal`**

Thêm vào `openEditModal`:

```tsx
const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setDescription(product.description);
    setLink(product.link || '');
    setExistingFiles(product.files || []);
    setPendingDeleteIds([]);
    setNewFiles([]);
    setFileError('');
    setThumbnail(null);
    setThumbnailPreview(null);
    setExistingThumbnail(product.thumbnail || null);
    setDeleteThumbnail(false);
    setShowModal(true);
};
```

- [ ] **Step 5: Cập nhật `handleSubmit`**

```tsx
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
                thumbnail: thumbnail || undefined,
                deleteThumbnail,
            });
        } else {
            await api.createProduct({ title, description, link: link || undefined, files: newFiles, thumbnail });
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
```

- [ ] **Step 6: Thêm thumbnail handler**

```tsx
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
```

- [ ] **Step 7: Thêm thumbnail section vào form trong modal**

Thêm block sau thẻ đóng `</div>` của field "Link sản phẩm", trước block "File đính kèm":

```tsx
{/* Ảnh đại diện */}
<div>
    <label className="block text-sm font-medium mb-2">
        Ảnh đại diện <span className="text-muted-foreground font-normal">(không bắt buộc)</span>
    </label>
    {(thumbnailPreview || (existingThumbnail && !deleteThumbnail)) ? (
        <div className="relative inline-block">
            <img
                src={thumbnailPreview || existingThumbnail?.url}
                alt="Thumbnail preview"
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
            >
                ✕
            </button>
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
    <input
        ref={thumbnailInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleThumbnailSelect}
    />
</div>
```

- [ ] **Step 8: Thêm thumbnail vào product card**

Trong phần render card sản phẩm, thêm thumbnail trước title:

```tsx
{product.thumbnail && (
    <img
        src={product.thumbnail.url}
        alt={product.title}
        className="w-full h-40 object-cover rounded-lg mb-3"
    />
)}
```

- [ ] **Step 9: Commit**

```bash
git add frontend/src/app/dashboard/products/page.tsx
git commit -m "feat(dashboard/products): add thumbnail upload/preview/delete support"
```

---

## Task 12: Tạo Trang Public Showcase

**Files:**
- Create: `frontend/src/app/showcase/page.tsx`

- [ ] **Step 1: Tạo file**

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product, ShowcaseResponse } from '@/types';

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

function FeaturedCard({ product }: { product: Product }) {
    return (
        <div className="flex gap-6 bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
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
                    <div className="flex flex-wrap gap-2 mb-3">
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
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                        🔗 Xem dự án
                    </a>
                )}
            </div>
        </div>
    );
}

function ProductCard({ product }: { product: Product }) {
    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
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
                                        <FeaturedCard key={product._id} product={product} />
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
                                        <ProductCard key={product._id} product={product} />
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/showcase/page.tsx
git commit -m "feat(showcase): add public showcase page with featured section and student filter"
```

---

## Task 13: Thêm Mục "Sản phẩm" vào Admin Sidebar

**Files:**
- Modify: `frontend/src/app/admin/layout.tsx`

- [ ] **Step 1: Thêm link vào navLinks**

Trong `frontend/src/app/admin/layout.tsx`, tìm array `navLinks` và thêm:

```tsx
const navLinks = [
    { href: '/admin/registrations', label: 'Quản lý Đăng ký', icon: '📝' },
    { href: '/admin/classes', label: 'Quản lý Lớp học', icon: '🏫' },
    { href: '/admin/sessions', label: 'Quản lý Bài học', icon: '📚' },
    { href: '/admin/products', label: 'Sản phẩm học viên', icon: '🎨' },
];
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/admin/layout.tsx
git commit -m "feat(admin): add Sản phẩm học viên to admin sidebar"
```

---

## Task 14: Tạo Trang Admin Products

**Files:**
- Create: `frontend/src/app/admin/products/page.tsx`

- [ ] **Step 1: Tạo file**

```tsx
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
        setTargetUserId(typeof product.user === 'object' ? (product.user as any)._id : product.user);
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
                    title, description, link: link || undefined,
                    files: newFiles, deleteFileIds: pendingDeleteIds,
                    thumbnail: thumbnail || undefined, deleteThumbnail,
                });
            } else {
                await api.adminCreateProduct({
                    targetUserId, title, description,
                    link: link || undefined, files: newFiles,
                    thumbnail, isFeatured,
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
                                    disabled={!!editingProduct}
                                    value={targetUserId}
                                    onChange={(e) => setTargetUserId(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                                >
                                    <option value="">Chọn học viên...</option>
                                    {students.map((s) => (
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
                                    <label htmlFor="isFeatured" className="text-sm font-medium">
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/admin/products/page.tsx
git commit -m "feat(admin/products): add admin products management page with create/edit/delete/featured toggle"
```

---

## Task 15: Kiểm tra và Commit Tổng hợp

- [ ] **Step 1: Verify backend build**

```bash
cd backend && npx nest build 2>&1 | tail -10
```

Expected: `Successfully compiled project`

- [ ] **Step 2: Verify frontend build**

```bash
cd frontend && npx next build 2>&1 | tail -20
```

Expected: không có lỗi TypeScript, build thành công.

- [ ] **Step 3: Chạy thủ công — kiểm tra luồng Admin tạo sản phẩm**

1. Đăng nhập với tài khoản admin (`admin@example.com` / `123456`)
2. Vào `/admin/products`
3. Click "+ Tạo sản phẩm"
4. Chọn học viên, điền thông tin, upload ảnh đại diện, click "Tạo sản phẩm"
5. Verify: sản phẩm xuất hiện trong danh sách với badge "Admin tạo"
6. Đăng nhập bằng tài khoản học viên đó
7. Vào `/dashboard/products` → sản phẩm phải hiển thị

- [ ] **Step 4: Chạy thủ công — kiểm tra Showcase**

1. Truy cập `/showcase` (không cần đăng nhập)
2. Verify: header có tab "Sản phẩm"
3. Verify: sản phẩm nổi bật (isFeatured=true) hiển thị ở section trên
4. Verify: filter dropdown chỉ hiện học viên có sản phẩm
5. Chọn 1 học viên → section "Tất cả sản phẩm" chỉ hiện sản phẩm của họ

- [ ] **Step 5: Chạy thủ công — toggle Featured**

1. Admin vào `/admin/products`
2. Click ☆ trên 1 sản phẩm → icon thành ⭐, badge "Nổi bật" xuất hiện
3. Vào `/showcase` → sản phẩm đó hiện trong section "Nổi bật"

---

## Self-Review

**Spec coverage:**
- ✅ Admin tạo sản phẩm thay học viên (Task 4, 5, 6, 14)
- ✅ Sản phẩm hiện trong portfolio học viên — `GET /products/my` query by `user` field không đổi (Task 5)
- ✅ Học viên có quyền sửa/xóa bình thường — `update`/`delete` check `isOwner || isAdmin` (Task 5)
- ✅ Thumbnail upload (Task 2, 5, 6, 11, 14)
- ✅ `isFeatured` chỉ admin set (Task 6, 14)
- ✅ `GET /admin/products` xem tất cả sản phẩm kể cả học viên tự tạo (Task 6)
- ✅ Badge "Admin tạo" và "Nổi bật" (Task 14)
- ✅ Toggle featured không reload trang (Task 14)
- ✅ Tab "Sản phẩm" trên header public (Task 10)
- ✅ Section nổi bật không bị filter ảnh hưởng (Task 12)
- ✅ Dropdown chỉ liệt kê học viên có sản phẩm (Task 5 - aggregate)
- ✅ Admin sidebar thêm mục Sản phẩm (Task 13)

**Type consistency:**
- `Product` interface dùng nhất quán từ `@/types` ở cả Task 11, 12, 14
- `ProductsService.update` ký hiệu nhất quán với `products.controller.ts`
- `adminGetStudents()` trong API client → `GET /admin/products/students` (route trong AdminProductsController) ✅
