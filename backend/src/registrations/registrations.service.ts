import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    Registration,
    RegistrationDocument,
    RegistrationStatus,
} from './schemas/registration.schema';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationStatusDto } from './dto/update-registration-status.dto';
import { ClassesService } from '../classes/classes.service';
import { ClassStatus } from '../classes/schemas/class.schema';

@Injectable()
export class RegistrationsService {
    constructor(
        @InjectModel(Registration.name)
        private registrationModel: Model<RegistrationDocument>,
        private classesService: ClassesService,
    ) { }

    async create(
        userId: string,
        createRegistrationDto: CreateRegistrationDto,
    ): Promise<Registration> {
        const { classId } = createRegistrationDto;

        // Verify class exists and is open
        const classDoc = await this.classesService.findOne(classId);

        if (classDoc.status !== ClassStatus.OPEN) {
            throw new BadRequestException(
                'This class is not open for registration',
            );
        }

        if (classDoc.currentStudents >= classDoc.maxStudents) {
            throw new BadRequestException('This class is full');
        }

        // Check for duplicate registration
        const existingRegistration = await this.registrationModel
            .findOne({ user: userId, class: classId } as any)
            .exec();

        if (existingRegistration) {
            throw new ConflictException(
                'You have already registered for this class',
            );
        }

        const registration = new this.registrationModel({
            user: userId,
            class: classId,
            course: classDoc.course,
            status: RegistrationStatus.PENDING,
        });

        return registration.save();
    }

    async findMyRegistrations(userId: string): Promise<Registration[]> {
        return this.registrationModel
            .find({ user: userId } as any)
            .populate('class')
            .populate('course')
            .sort({ createdAt: -1 })
            .exec();
    }

    async findAll(
        status?: RegistrationStatus,
        courseId?: string,
        classId?: string,
    ): Promise<Registration[]> {
        const filter: any = {};

        if (status) {
            filter.status = status;
        }
        if (courseId) {
            filter.course = courseId;
        }
        if (classId) {
            filter.class = classId;
        }

        return this.registrationModel
            .find(filter)
            .populate('user')
            .populate('class')
            .populate('course')
            .populate('approvedBy')
            .sort({ createdAt: -1 })
            .exec();
    }

    async updateStatus(
        id: string,
        adminId: string,
        updateDto: UpdateRegistrationStatusDto,
    ): Promise<Registration> {
        const registration = await this.registrationModel.findById(id).exec();

        if (!registration) {
            throw new NotFoundException(`Registration with ID ${id} not found`);
        }

        registration.status = updateDto.status;

        if (updateDto.adminNote) {
            registration.adminNote = updateDto.adminNote;
        }

        if (updateDto.status === RegistrationStatus.APPROVED) {
            registration.approvedBy = adminId as any;
            registration.approvedAt = new Date();

            // Increment class student count
            await this.classesService.incrementStudentCount(
                registration.class.toString(),
            );
        }

        return registration.save();
    }
}
