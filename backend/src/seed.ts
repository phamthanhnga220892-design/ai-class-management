
import { NestFactory } from '@nestjs/core';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { User, UserSchema, UserRole } from './users/schemas/user.schema';
import { Course, CourseSchema } from './courses/schemas/course.schema';
import { Class, ClassSchema, ClassStatus } from './classes/schemas/class.schema';
import { Session, SessionSchema } from './sessions/schemas/session.schema';
import { Comment, CommentSchema } from './comments/schemas/comment.schema';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({ uri: config.get('MONGODB_URI') }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Course.name, schema: CourseSchema },
            { name: Class.name, schema: ClassSchema },
            { name: Session.name, schema: SessionSchema },
            { name: Comment.name, schema: CommentSchema },
        ]),
    ],
})
class SeedModule { }

async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(SeedModule);

    const userModel = appContext.get<Model<User>>(getModelToken(User.name));
    const courseModel = appContext.get<Model<Course>>(getModelToken(Course.name));
    const classModel = appContext.get<Model<Class>>(getModelToken(Class.name));
    const sessionModel = appContext.get<Model<Session>>(getModelToken(Session.name));
    const commentModel = appContext.get<Model<Comment>>(getModelToken(Comment.name));

    console.log('🌱 Seeding database...');

    // 1. Create Admin
    const adminEmail = 'admin@example.com';
    const existingAdmin = await userModel.findOne({ email: adminEmail });
    let adminUser;

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        adminUser = await userModel.create({
            fullName: 'Super Admin',
            email: adminEmail,
            password: hashedPassword,
            role: UserRole.ADMIN,
        });
        console.log('✅ Admin user created');
    } else {
        adminUser = existingAdmin;
        console.log('ℹ️ Admin user already exists');
    }

    // 2. Create Sample Courses
    const courseCount = await courseModel.countDocuments();
    let courses;

    if (courseCount === 0) {
        courses = await courseModel.create([
            {
                title: 'AI Kid - Khám phá sáng tạo (7-10 tuổi)',
                description: 'Khóa học AI dành cho trẻ em 7-10 tuổi, tập trung vào khám phá sáng tạo với AI.',
                price: 2000000,
                instructor: adminUser._id,
                totalSessions: 12,
                totalDuration: 720,
                thumbnail: 'https://placehold.co/600x400?text=AI+Kid',
            },
            {
                title: 'AI Teen - Thực hành chuyên sâu (>10 tuổi)',
                description: 'Khóa học AI dành cho thanh thiếu niên, học nghề và thực hành chuyên sâu.',
                price: 3000000,
                instructor: adminUser._id,
                totalSessions: 20,
                totalDuration: 1200,
                thumbnail: 'https://placehold.co/600x400?text=AI+Teen',
            },
        ]);
        console.log('✅ Sample courses created');
    } else {
        courses = await courseModel.find().exec();
        console.log('ℹ️ Courses already exist');
    }

    // 3. Create Sample Classes
    const classCount = await classModel.countDocuments();
    if (classCount === 0 && courses.length >= 2) {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const twoMonthsLater = new Date(now.getFullYear(), now.getMonth() + 2, 1);

        await classModel.create([
            // AI Kid classes
            {
                course: courses[0]._id,
                name: 'Lớp AI Kid K01 - Tháng 1/2026',
                mentorName: 'Cô Hương',
                startDate: nextMonth,
                endDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 3, 0),
                schedule: 'Thứ 7, 9:00-11:00',
                maxStudents: 15,
                currentStudents: 0,
                status: ClassStatus.OPEN,
            },
            {
                course: courses[0]._id,
                name: 'Lớp AI Kid K02 - Tháng 2/2026',
                mentorName: 'Thầy Minh',
                startDate: twoMonthsLater,
                endDate: new Date(twoMonthsLater.getFullYear(), twoMonthsLater.getMonth() + 3, 0),
                schedule: 'Chủ nhật, 14:00-16:00',
                maxStudents: 15,
                currentStudents: 0,
                status: ClassStatus.OPEN,
            },
            // AI Teen classes
            {
                course: courses[1]._id,
                name: 'Lớp AI Teen T01 - Tháng 1/2026',
                mentorName: 'Thầy Tuấn',
                startDate: nextMonth,
                endDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 5, 0),
                schedule: 'Thứ 7, 14:00-17:00',
                maxStudents: 12,
                currentStudents: 0,
                status: ClassStatus.OPEN,
            },
            {
                course: courses[1]._id,
                name: 'Lớp AI Teen T02 - Tháng 2/2026',
                mentorName: 'Cô Lan',
                startDate: twoMonthsLater,
                endDate: new Date(twoMonthsLater.getFullYear(), twoMonthsLater.getMonth() + 5, 0),
                schedule: 'Chủ nhật, 9:00-12:00',
                maxStudents: 12,
                currentStudents: 0,
                status: ClassStatus.OPEN,
            },
        ]);
        console.log('✅ Sample classes created');
    } else {
        console.log('ℹ️ Classes already exist');
    }

    // 4. Create Sample Sessions
    const sessionCount = await sessionModel.countDocuments();
    if (sessionCount === 0) {
        const classes = await classModel.find().exec();

        if (classes.length > 0) {
            const sessionsToCreate: any[] = [];

            for (const classDoc of classes) {
                // Create 3 sample sessions for each class
                sessionsToCreate.push(
                    {
                        class: classDoc._id,
                        title: 'Bài 1: Giới thiệu về AI',
                        content: '<h2>Chào mừng đến với khóa học AI!</h2><p>Trong bài học này, chúng ta sẽ tìm hiểu về khái niệm cơ bản của Trí tuệ nhân tạo (AI).</p>',
                        videoUrl: 'https://www.youtube.com/watch?v=example1',
                        orderIndex: 1,
                    },
                    {
                        class: classDoc._id,
                        title: 'Bài 2: Ứng dụng AI trong đời sống',
                        content: '<h2>AI xung quanh chúng ta</h2><p>Khám phá các ứng dụng thực tế của AI trong cuộc sống hàng ngày.</p>',
                        videoUrl: 'https://www.youtube.com/watch?v=example2',
                        orderIndex: 2,
                    },
                    {
                        class: classDoc._id,
                        title: 'Bài 3: Thực hành đầu tiên',
                        content: '<h2>Bắt tay vào làm!</h2><p>Cùng thực hành tạo dự án AI đầu tiên của bạn.</p>',
                        videoUrl: 'https://www.youtube.com/watch?v=example3',
                        orderIndex: 3,
                    },
                );
            }

            await sessionModel.create(sessionsToCreate);
            console.log('✅ Sample sessions created');
        }
    } else {
        console.log('ℹ️ Sessions already exist');
    }

    // 5. Create Sample Comments
    const commentCount = await commentModel.countDocuments();
    if (commentCount === 0) {
        const sessions = await sessionModel.find().limit(3).exec();

        if (sessions.length > 0 && adminUser) {
            const commentsToCreate: any[] = [];

            for (const session of sessions) {
                // Create 2-3 comments per session
                commentsToCreate.push(
                    {
                        session: session._id,
                        user: adminUser._id,
                        content: 'Bài học rất hay! Các em đã hiểu rõ về AI chưa?',
                    },
                    {
                        session: session._id,
                        user: adminUser._id,
                        content: 'Nhớ làm bài tập về nhà nhé các em!',
                    },
                );
            }

            await commentModel.create(commentsToCreate);
            console.log('✅ Sample comments created');
        }
    } else {
        console.log('ℹ️ Comments already exist');
    }

    console.log('🚀 Seeding completed!');
    await appContext.close();
}

bootstrap();
