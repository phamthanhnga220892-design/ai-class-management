import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    ) { }

    async create(createSessionDto: CreateSessionDto): Promise<Session> {
        const createdSession = new this.sessionModel({
            title: createSessionDto.title,
            content: createSessionDto.content,
            videoUrl: createSessionDto.videoUrl,
            orderIndex: createSessionDto.orderIndex,
            class: new Types.ObjectId(createSessionDto.classId),
        });
        return createdSession.save();
    }

    async findAll(classId?: string): Promise<Session[]> {
        const filter: any = classId ? { class: new Types.ObjectId(classId) } : {};
        return this.sessionModel
            .find(filter)
            .populate('class')
            .sort({ orderIndex: 1 })
            .lean()
            .exec();
    }

    async findOne(id: string): Promise<Session> {
        const session = await this.sessionModel
            .findById(id)
            .populate('class')
            .lean()
            .exec();

        if (!session) {
            throw new NotFoundException(`Session with ID ${id} not found`);
        }

        return session;
    }

    async update(id: string, updateSessionDto: UpdateSessionDto): Promise<Session> {
        const updatedSession = await this.sessionModel
            .findByIdAndUpdate(id, updateSessionDto, { new: true })
            .populate('class')
            .lean()
            .exec();

        if (!updatedSession) {
            throw new NotFoundException(`Session with ID ${id} not found`);
        }

        return updatedSession;
    }

    async delete(id: string): Promise<void> {
        const result = await this.sessionModel.findByIdAndDelete(id).exec();

        if (!result) {
            throw new NotFoundException(`Session with ID ${id} not found`);
        }
    }
}
