import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateSessionDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    videoUrl?: string;

    @IsNumber()
    @Min(1)
    @IsOptional()
    orderIndex?: number;
}
