import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    // Get current user's products (protected)
    @UseGuards(JwtAuthGuard)
    @Get('my')
    getMyProducts(@Request() req) {
        return this.productsService.getMyProducts(req.user.userId);
    }

    // Get public portfolio (no auth required)
    @Get('portfolio/:userId')
    getPublicPortfolio(@Param('userId') userId: string) {
        return this.productsService.getPublicPortfolio(userId);
    }

    // Create product (protected)
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Request() req, @Body() createProductDto: CreateProductDto) {
        return this.productsService.create(req.user.userId, createProductDto);
    }

    // Update product (protected)
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto
    ) {
        return this.productsService.update(req.user.userId, id, updateProductDto);
    }

    // Delete product (protected)
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Request() req, @Param('id') id: string) {
        return this.productsService.delete(req.user.userId, id);
    }
}
