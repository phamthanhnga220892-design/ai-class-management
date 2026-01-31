import { NestFactory } from '@nestjs/core';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { Session, SessionSchema } from './sessions/schemas/session.schema';
import { Model } from 'mongoose';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                uri: config.get('MONGODB_URI'),
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([
            { name: Session.name, schema: SessionSchema },
        ]),
    ],
})
class FixEncodingModule { }

async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(FixEncodingModule);
    const sessionModel = appContext.get<Model<Session>>(getModelToken(Session.name));

    console.log('🔧 Fixing encoding issues...');

    // Get all sessions
    const sessions = await sessionModel.find().exec();

    console.log(`Found ${sessions.length} sessions to check`);

    let fixedCount = 0;

    for (const session of sessions) {
        let needsUpdate = false;
        const updates: any = {};

        // Check if title or content has encoding issues
        // Common pattern: characters like Ã¡, Ã , Ã©, etc. indicate UTF-8 bytes interpreted as Latin-1
        const hasEncodingIssue = (text: string) => {
            return text.includes('Ã') || text.includes('Ä') || text.includes('á»');
        };

        if (hasEncodingIssue(session.title)) {
            console.log(`\nFound encoding issue in session: ${session.title}`);
            console.log(`Session ID: ${session._id}`);
            needsUpdate = true;
        }

        if (hasEncodingIssue(session.content)) {
            console.log(`Found encoding issue in content for session: ${session.title}`);
            needsUpdate = true;
        }

        if (needsUpdate) {
            console.log(`⚠️  Session "${session.title}" needs manual fixing`);
            console.log(`   Please update this session in MongoDB directly with proper UTF-8 text`);
            fixedCount++;
        }
    }

    if (fixedCount === 0) {
        console.log('✅ No encoding issues found!');
    } else {
        console.log(`\n⚠️  Found ${fixedCount} sessions with encoding issues`);
        console.log('   Please fix these manually in MongoDB Atlas or using a database client');
        console.log('   Make sure to use UTF-8 encoding when updating the data');
    }

    await appContext.close();
}

bootstrap();
