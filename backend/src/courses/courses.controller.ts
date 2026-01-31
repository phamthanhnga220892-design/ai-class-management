import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Get()
    findAll() {
        return this.coursesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.coursesService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateData: any) {
        return this.coursesService.update(id, updateData);
    }
}
