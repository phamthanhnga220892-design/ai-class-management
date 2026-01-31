import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('classes')
export class ClassesController {
    constructor(private readonly classesService: ClassesService) { }

    @Get()
    findAll(@Query('courseId') courseId?: string) {
        return this.classesService.findAll(courseId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.classesService.findOne(id);
    }
}

@Controller('admin/classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminClassesController {
    constructor(private readonly classesService: ClassesService) { }

    @Post()
    create(@Body() createClassDto: CreateClassDto) {
        return this.classesService.create(createClassDto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
        return this.classesService.update(id, updateClassDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.classesService.delete(id);
        return { message: 'Class deleted successfully' };
    }

    @Get(':id/details')
    getClassDetails(@Param('id') id: string) {
        return this.classesService.findClassDetails(id);
    }

    @Get('debug/registrations')
    async debugRegistrations() {
        return this.classesService.debugRegistrations();
    }
}
