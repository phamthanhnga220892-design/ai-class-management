import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RegistrationStatus } from '../schemas/registration.schema';

export class UpdateRegistrationStatusDto {
    @IsEnum(RegistrationStatus)
    status: RegistrationStatus;

    @IsOptional()
    @IsString()
    adminNote?: string;
}
