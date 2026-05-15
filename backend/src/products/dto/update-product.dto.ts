import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    deleteFileIds?: string[];
}
