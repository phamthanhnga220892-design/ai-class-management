import { IsMongoId } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class AdminCreateProductDto extends CreateProductDto {
    @IsMongoId()
    targetUserId: string;
}
