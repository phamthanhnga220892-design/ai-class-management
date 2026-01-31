import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassesService } from './classes.service';
import { ClassesController, AdminClassesController } from './classes.controller';
import { Class, ClassSchema } from './schemas/class.schema';
import { Registration, RegistrationSchema } from '../registrations/schemas/registration.schema';
import { Session, SessionSchema } from '../sessions/schemas/session.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Class.name, schema: ClassSchema },
            { name: Registration.name, schema: RegistrationSchema },
            { name: Session.name, schema: SessionSchema },
        ]),
    ],
    controllers: [ClassesController, AdminClassesController],
    providers: [ClassesService],
    exports: [ClassesService],
})
export class ClassesModule { }

