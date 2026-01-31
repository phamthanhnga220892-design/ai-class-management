import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

// Public endpoint for students to view sessions
@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(@Query('classId') classId?: string) {
        return this.sessionsService.findAll(classId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string) {
        return this.sessionsService.findOne(id);
    }
}

// Admin endpoints for managing sessions
@Controller('admin/sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminSessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Post()
    create(@Body() createSessionDto: CreateSessionDto) {
        return this.sessionsService.create(createSessionDto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
        return this.sessionsService.update(id, updateSessionDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.sessionsService.delete(id);
        return { message: 'Session deleted successfully' };
    }
}
