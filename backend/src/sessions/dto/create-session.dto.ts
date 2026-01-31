import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateSessionDto {
    @IsString()
    @IsNotEmpty()
    classId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    videoUrl?: string;

    @IsNumber()
    @Min(1)
    orderIndex: number;
}
