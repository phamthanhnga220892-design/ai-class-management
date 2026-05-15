import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class SessionsService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
        private cloudinaryService: CloudinaryService,
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
        const session = await this.sessionModel.findById(id).exec();

        if (!session) {
            throw new NotFoundException(`Session with ID ${id} not found`);
        }

        if (session.attachments && session.attachments.length > 0) {
            await Promise.allSettled(
                session.attachments.map((a) =>
                    this.cloudinaryService.deleteFile(a.publicId, this.mimetypeToFileType(a.mimetype)),
                ),
            );
        }

        await this.sessionModel.findByIdAndDelete(id).exec();
    }

    // --- Attachment methods ---

    async addAttachment(sessionId: string, file: Express.Multer.File): Promise<Session> {
        const session = await this.sessionModel.findById(sessionId).exec();
        if (!session) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        // Check max 5 attachments
        if (session.attachments && session.attachments.length >= 5) {
            throw new BadRequestException('Maximum 5 attachments per session');
        }

        const result = await this.cloudinaryService.uploadFile(file.buffer, file.originalname, file.mimetype);

        session.attachments.push({
            filename: result.filename,
            url: result.url,
            publicId: result.publicId,
            mimetype: file.mimetype,
            size: file.size,
        });

        await session.save();

        return this.sessionModel
            .findById(sessionId)
            .populate('class')
            .lean()
            .exec() as Promise<Session>;
    }

    private mimetypeToFileType(mimetype: string): 'image' | 'video' | 'document' {
        if (mimetype.startsWith('image/')) return 'image';
        if (mimetype.startsWith('video/')) return 'video';
        return 'document';
    }

    async removeAttachment(sessionId: string, publicId: string): Promise<Session> {
        const session = await this.sessionModel.findById(sessionId).exec();
        if (!session) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        const attachmentIndex = session.attachments.findIndex(
            (a) => a.publicId === publicId,
        );

        if (attachmentIndex === -1) {
            throw new NotFoundException('Attachment not found');
        }

        await this.cloudinaryService.deleteFile(publicId, this.mimetypeToFileType(session.attachments[attachmentIndex].mimetype));

        // Remove from session
        session.attachments.splice(attachmentIndex, 1);
        await session.save();

        return this.sessionModel
            .findById(sessionId)
            .populate('class')
            .lean()
            .exec() as Promise<Session>;
    }
}
