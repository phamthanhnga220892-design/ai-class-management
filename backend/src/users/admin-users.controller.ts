import {
    Controller, Get, Delete, Patch,
    Param, Body, Request, UseGuards, HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { UsersService } from './users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

interface AuthRequest {
    user: { userId: string };
}

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Delete(':id')
    @HttpCode(204)
    deleteUser(@Request() req: AuthRequest, @Param('id') id: string) {
        return this.usersService.deleteUser(req.user.userId, id);
    }

    @Patch(':id/reset-password')
    @HttpCode(204)
    resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
        return this.usersService.resetPassword(id, dto.newPassword);
    }
}
