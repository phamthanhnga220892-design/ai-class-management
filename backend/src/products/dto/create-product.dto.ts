import { IsString, IsNotEmpty, MaxLength, IsUrl } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    description: string;

    @IsString()
    @IsNotEmpty()
    @IsUrl({}, { message: 'Link phải là URL hợp lệ' })
    link: string;
}
