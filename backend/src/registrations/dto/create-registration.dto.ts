import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRegistrationDto {
    @IsNotEmpty()
    @IsString()
    classId: string;
}
