import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';

@Injectable()
export class CoursesService {
    constructor(
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    ) { }

    async findAll(): Promise<Course[]> {
        return this.courseModel
            .find()
            .populate('instructor', 'fullName email')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    async findOne(id: string): Promise<Course> {
        const course = await this.courseModel.findById(id).exec();
        if (!course) {
            throw new NotFoundException(`Course with ID ${id} not found`);
        }
        return course;
    }

    async update(id: string, updateData: Partial<Course>): Promise<Course> {
        const course = await this.courseModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
        if (!course) {
            throw new NotFoundException(`Course with ID ${id} not found`);
        }
        return course;
    }
}
