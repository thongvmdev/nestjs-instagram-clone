import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('photos/:photoId/comments')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('photoId', ParseIntPipe) photoId: number,
    @Body() body: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.create(body.comment_text, user.id, photoId);
  }

  @Get('photos/:photoId/comments')
  findByPhoto(@Param('photoId', ParseIntPipe) photoId: number) {
    return this.commentsService.findByPhoto(photoId);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.commentsService.remove(id, user.id);
  }
}
