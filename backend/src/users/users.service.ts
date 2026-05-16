import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async create(createUserDto: any): Promise<UserDocument> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
            role: createUserDto.role || UserRole.STUDENT,
        });
        return createdUser.save();
    }

    async findOneByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    async findAllStudents(): Promise<{ _id: any; fullName: string; email: string }[]> {
        return this.userModel
            .find({ role: UserRole.STUDENT, isActive: true })
            .select('fullName email')
            .sort({ fullName: 1 })
            .lean()
            .exec();
    }

    async findAll(): Promise<Omit<UserDocument, 'password'>[]> {
        return this.userModel
            .find()
            .select('-password')
            .sort({ createdAt: -1 })
            .lean()
            .exec() as any;
    }

    async deleteUser(adminId: string, targetId: string): Promise<void> {
        if (adminId === targetId) {
            throw new ForbiddenException('Không thể xóa tài khoản của chính mình');
        }
        const user = await this.userModel.findById(targetId).exec();
        if (!user) {
            throw new NotFoundException('Không tìm thấy user');
        }
        await this.userModel.findByIdAndDelete(targetId).exec();
    }

    async resetPassword(targetId: string, newPassword: string): Promise<void> {
        const user = await this.userModel.findById(targetId).exec();
        if (!user) {
            throw new NotFoundException('Không tìm thấy user');
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        await this.userModel.findByIdAndUpdate(targetId, { $set: { password: hashed } }).exec();
    }
}
