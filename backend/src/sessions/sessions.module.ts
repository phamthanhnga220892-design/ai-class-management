import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionsService } from './sessions.service';
import { SessionsController, AdminSessionsController } from './sessions.controller';
import { Session, SessionSchema } from './schemas/session.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
        CloudinaryModule,
    ],
    controllers: [SessionsController, AdminSessionsController],
    providers: [SessionsService],
    exports: [SessionsService],
})
export class SessionsModule { }
