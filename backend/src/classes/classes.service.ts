import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Class, ClassDocument } from './schemas/class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassDetailsResponseDto } from './dto/class-details.dto';
import { Registration, RegistrationDocument, RegistrationStatus } from '../registrations/schemas/registration.schema';
import { Session, SessionDocument } from '../sessions/schemas/session.schema';


@Injectable()
export class ClassesService {
    constructor(
        @InjectModel(Class.name) private classModel: Model<ClassDocument>,
        @InjectModel(Registration.name) private registrationModel: Model<RegistrationDocument>,
        @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    ) { }

    async create(createClassDto: CreateClassDto): Promise<Class> {
        const createdClass = new this.classModel({
            ...createClassDto,
            course: createClassDto.courseId,
        });
        return createdClass.save();
    }

    async findAll(courseId?: string): Promise<Class[]> {
        let filter: any = {};

        if (courseId) {
            // Handle both ObjectId and string formats
            filter = {
                $or: [
                    { course: courseId },
                    { course: new Types.ObjectId(courseId) }
                ]
            };
        }

        return this.classModel
            .find(filter)
            .populate('course')
            .sort({ startDate: -1 })
            .lean()
            .exec();
    }

    async findOne(id: string): Promise<Class> {
        const classDoc = await this.classModel
            .findById(id)
            .populate('course')
            .lean()
            .exec();

        if (!classDoc) {
            throw new NotFoundException(`Class with ID ${id} not found`);
        }

        return classDoc;
    }

    async update(id: string, updateClassDto: UpdateClassDto): Promise<Class> {
        const updatedClass = await this.classModel
            .findByIdAndUpdate(id, updateClassDto, { new: true })
            .populate('course')
            .lean()
            .exec();

        if (!updatedClass) {
            throw new NotFoundException(`Class with ID ${id} not found`);
        }

        return updatedClass;
    }

    async delete(id: string): Promise<void> {
        const result = await this.classModel.findByIdAndDelete(id).exec();

        if (!result) {
            throw new NotFoundException(`Class with ID ${id} not found`);
        }
    }

    async incrementStudentCount(classId: string): Promise<void> {
        await this.classModel
            .findByIdAndUpdate(classId, { $inc: { currentStudents: 1 } })
            .exec();
    }

    async findClassDetails(id: string): Promise<ClassDetailsResponseDto> {
        // Get class information
        const classDoc = await this.classModel
            .findById(id)
            .populate('course')
            .lean()
            .exec();

        if (!classDoc) {
            throw new NotFoundException(`Class with ID ${id} not found`);
        }

        // Get approved students with their registration info
        // Get ALL registrations first to debug
        const allRegistrations = await this.registrationModel
            .find({})
            .populate('user', 'fullName email phone')
            .lean()
            .exec();

        console.log('Debug - Total registrations in DB:', allRegistrations.length);
        console.log('Debug - Looking for class ID:', id);
        console.log('Debug - All class IDs:', allRegistrations.map((r: any) => ({
            classId: r.class?.toString(),
            matches: r.class?.toString() === id
        })));

        // Filter by class ID manually
        const classRegistrations = allRegistrations.filter((r: any) =>
            r.class && r.class.toString() === id
        );

        console.log('Debug - Registrations for this class:', classRegistrations.length);
        console.log('Debug - Registration details:', classRegistrations.map((r: any) => ({
            user: r.user?.fullName,
            status: r.status,
            hasUser: !!r.user
        })));

        const students = classRegistrations
            .filter((reg: any) => reg.user) // Only include if user exists
            .map((reg: any) => ({
                _id: reg.user._id,
                fullName: reg.user.fullName,
                email: reg.user.email,
                phone: reg.user.phone,
                registeredAt: reg.createdAt,
            }));

        console.log('Debug - Found students after mapping:', students.length);

        // Get sessions and manually count comments (same approach as registrations)
        const allSessions = await this.sessionModel
            .find({})
            .lean()
            .exec();

        const classSessions = allSessions.filter((s: any) =>
            s.class && s.class.toString() === id
        );

        console.log('Debug - Total sessions in DB:', allSessions.length);
        console.log('Debug - Sessions for this class:', classSessions.length);

        // Get all comments to count
        const Comment = this.sessionModel.db.model('Comment');
        const allComments = await Comment.find({}).lean().exec();

        console.log('Debug - Total comments in DB:', allComments.length);

        // Map sessions with comment counts
        const sessions = classSessions.map((session: any) => {
            const sessionComments = allComments.filter((c: any) =>
                c.session && c.session.toString() === session._id.toString()
            );

            return {
                _id: session._id,
                title: session.title,
                orderIndex: session.orderIndex,
                createdAt: session.createdAt,
                commentCount: sessionComments.length,
            };
        }).sort((a, b) => a.orderIndex - b.orderIndex);

        console.log('Debug - Sessions with comments:', sessions.map(s => ({ title: s.title, commentCount: s.commentCount })));

        return {
            class: {
                _id: classDoc._id.toString(),
                name: classDoc.name,
                course: {
                    _id: (classDoc.course as any)._id.toString(),
                    name: (classDoc.course as any).name,
                },
                mentorName: classDoc.mentorName,
                startDate: classDoc.startDate,
                status: classDoc.status,
            },
            students,
            sessions,
            totalStudents: students.length,
        };
    }

    async debugRegistrations() {
        const allRegs = await this.registrationModel
            .find({})
            .populate('user', 'fullName email')
            .populate('class', 'name')
            .limit(20)
            .lean()
            .exec();

        return {
            total: allRegs.length,
            registrations: allRegs.map((r: any) => ({
                _id: r._id,
                user: r.user?.fullName,
                class: {
                    _id: r.class?._id,
                    name: r.class?.name,
                },
                status: r.status,
                classFieldType: typeof r.class,
            })),
        };
    }

}
