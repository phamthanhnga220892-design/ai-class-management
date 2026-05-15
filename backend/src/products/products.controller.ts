import {
    Controller, Get, Post, Put, Delete,
    Body, Param, UseGuards, Request,
    UseInterceptors, UploadedFiles,
    BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @UseGuards(JwtAuthGuard)
    @Get('my')
    getMyProducts(@Request() req) {
        return this.productsService.getMyProducts(req.user.userId);
    }

    @Get('portfolio/:userId')
    getPublicPortfolio(@Param('userId') userId: string) {
        return this.productsService.getPublicPortfolio(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FilesInterceptor('files', MAX_FILES_PER_PRODUCT, multerOptions))
    create(
        @Request() req,
        @Body() createProductDto: CreateProductDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.productsService.create(req.user.userId, createProductDto, files ?? []);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @UseInterceptors(FilesInterceptor('files', MAX_FILES_PER_PRODUCT, multerOptions))
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.productsService.update(req.user.userId, id, updateProductDto, files ?? []);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Request() req, @Param('id') id: string) {
        return this.productsService.delete(req.user.userId, id);
    }
}
