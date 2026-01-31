import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty()
    sessionId: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    parentId?: string; // For replies
}
