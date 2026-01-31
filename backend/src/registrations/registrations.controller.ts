import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationStatusDto } from './dto/update-registration-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { RegistrationStatus } from './schemas/registration.schema';

@Controller('registrations')
export class RegistrationsController {
    constructor(
        private readonly registrationsService: RegistrationsService,
    ) { }

    // Student endpoints
    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Request() req, @Body() createRegistrationDto: CreateRegistrationDto) {
        return this.registrationsService.create(
            req.user.userId,
            createRegistrationDto,
        );
    }

    @Get('my')
    @UseGuards(JwtAuthGuard)
    findMyRegistrations(@Request() req) {
        return this.registrationsService.findMyRegistrations(req.user.userId);
    }
}

@Controller('admin/registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminRegistrationsController {
    constructor(
        private readonly registrationsService: RegistrationsService,
    ) { }

    @Get()
    findAll(
        @Query('status') status?: RegistrationStatus,
        @Query('courseId') courseId?: string,
        @Query('classId') classId?: string,
    ) {
        return this.registrationsService.findAll(status, courseId, classId);
    }

    @Patch(':id/approve')
    approve(@Param('id') id: string, @Request() req) {
        return this.registrationsService.updateStatus(id, req.user.userId, {
            status: RegistrationStatus.APPROVED,
        });
    }

    @Patch(':id/reject')
    reject(
        @Param('id') id: string,
        @Request() req,
        @Body() body: { adminNote?: string },
    ) {
        return this.registrationsService.updateStatus(id, req.user.userId, {
            status: RegistrationStatus.REJECTED,
            adminNote: body.adminNote,
        });
    }
}
