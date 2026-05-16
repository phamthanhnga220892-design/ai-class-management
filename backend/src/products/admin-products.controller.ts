import {
    Controller, Get, Post, Patch,
    Body, Param, Query, UseGuards, Request,
    UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ProductsService } from './products.service';
import { UsersService } from '../users/users.service';
import { AdminCreateProductDto } from './dto/admin-create-product.dto';
import { productMulterOptions } from './multer.config';

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

    @Get('students')
    getStudents() {
        return this.usersService.findAllStudents();
    }

    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'files', maxCount: MAX_FILES_PER_PRODUCT },
    ], productMulterOptions))
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
}
