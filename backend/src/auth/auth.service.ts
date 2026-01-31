
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        // Check if user exists
        const existingUser = await this.usersService.findOneByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const newUser = await this.usersService.create(registerDto);
        // Remove password from response
        const { password, ...result } = newUser.toObject();
        return result;
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user._id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        };
    }

    async updateProfile(userId: string, updateData: { fullName?: string; phone?: string }) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (updateData.fullName) {
            user.fullName = updateData.fullName;
        }
        if (updateData.phone !== undefined) {
            user.phone = updateData.phone;
        }

        await user.save();

        return {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
        };
    }

    async getProfile(userId: string) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone || '',
            role: user.role,
        };
    }
}
