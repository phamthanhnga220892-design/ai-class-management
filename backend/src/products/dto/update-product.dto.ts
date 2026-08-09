import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsOptional, IsString, IsBoolean, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    deleteFileIds?: string[];

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    deleteThumbnail?: boolean;

    /** Chỉ admin được gửi: gán sản phẩm sang chủ sở hữu khác. */
    @IsOptional()
    @IsMongoId()
    targetUserId?: string;
}
