import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min } from 'class-validator';
import { ClassStatus } from '../schemas/class.schema';

export class UpdateClassDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    mentorName?: string;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsString()
    @IsOptional()
    schedule?: string;

    @IsNumber()
    @Min(1)
    @IsOptional()
    maxStudents?: number;

    @IsEnum(ClassStatus)
    @IsOptional()
    status?: ClassStatus;
}
