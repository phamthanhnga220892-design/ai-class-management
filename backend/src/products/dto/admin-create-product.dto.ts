import { IsString, IsNotEmpty } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class AdminCreateProductDto extends CreateProductDto {
    @IsString()
    @IsNotEmpty()
    targetUserId: string;
}
