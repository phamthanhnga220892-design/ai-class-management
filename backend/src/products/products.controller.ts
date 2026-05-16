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

const sharedMulterOptions = {
    storage: memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
        if (file.fieldname === 'thumbnail') {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new BadRequestException('Ảnh đại diện phải là file ảnh'), false);
            }
            return cb(null, true);
        }
        const ok = ALLOWED_MIMETYPES.some((type) =>
            type.endsWith('/') ? file.mimetype.startsWith(type) : file.mimetype === type,
        );
        if (!ok) return cb(new BadRequestException('Định dạng file không được hỗ trợ'), false);
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
    ], sharedMulterOptions))
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
    ], sharedMulterOptions))
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
