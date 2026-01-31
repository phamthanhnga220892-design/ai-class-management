import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    RegistrationsController,
    AdminRegistrationsController,
} from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { Registration, RegistrationSchema } from './schemas/registration.schema';
import { ClassesModule } from '../classes/classes.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Registration.name, schema: RegistrationSchema },
        ]),
        ClassesModule,
    ],
    controllers: [RegistrationsController, AdminRegistrationsController],
    providers: [RegistrationsService],
    exports: [RegistrationsService],
})
export class RegistrationsModule { }
