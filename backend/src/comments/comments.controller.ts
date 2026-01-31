import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    create(@Request() req, @Body() createCommentDto: CreateCommentDto) {
        return this.commentsService.create(req.user.userId, createCommentDto);
    }

    @Get()
    findBySession(@Query('sessionId') sessionId: string) {
        return this.commentsService.findBySession(sessionId);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    async delete(@Param('id') id: string, @Request() req) {
        const isAdmin = req.user.role === UserRole.ADMIN;
        await this.commentsService.delete(id, req.user.userId, isAdmin);
        return { message: 'Comment deleted successfully' };
    }
}

@Controller('admin/sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Get(':id/comments')
    getSessionComments(@Param('id') id: string) {
        return this.commentsService.findSessionCommentsWithReplies(id);
    }
}
