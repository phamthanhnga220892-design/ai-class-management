import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    fullName?: string;

    @IsString()
    @IsOptional()
    phone?: string;
}
