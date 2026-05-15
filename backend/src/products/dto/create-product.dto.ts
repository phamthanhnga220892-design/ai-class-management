import { IsString, IsNotEmpty, MaxLength, IsUrl, ValidateIf } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    description: string;

    @ValidateIf((o) => o.link != null && o.link !== '')
    @IsUrl({}, { message: 'Link phải là URL hợp lệ' })
    link?: string;
}
