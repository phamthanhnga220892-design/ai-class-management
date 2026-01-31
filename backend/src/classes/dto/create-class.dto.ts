import { IsNotEmpty, IsString, IsDateString, IsEnum, IsNumber, Min, IsOptional } from 'class-validator';
import { ClassStatus } from '../schemas/class.schema';

export class CreateClassDto {
    @IsNotEmpty()
    @IsString()
    courseId: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    mentorName: string;

    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsString()
    schedule?: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    maxStudents: number;

    @IsOptional()
    @IsEnum(ClassStatus)
    status?: ClassStatus;
}
