import {
    Controller, Get, Post, Put, Delete,
    Body, Param, Query, UseGuards, Request,
    UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { productMulterOptions } from './multer.config';

const MAX_FILES_PER_PRODUCT = 5;

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
    ], productMulterOptions))
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
    ], productMulterOptions))
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
        @UploadedFiles() uploadedFiles: { thumbnail?: Express.Multer.File[]; files?: Express.Multer.File[] },
    ) {
        const files = uploadedFiles?.files ?? [];
        const thumbnail = uploadedFiles?.thumbnail?.[0];
        const deleteThumbnail = updateProductDto.deleteThumbnail ?? false;
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
