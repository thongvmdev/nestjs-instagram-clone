import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('photos/:photoId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  like(
    @Param('photoId', ParseIntPipe) photoId: number,
    @CurrentUser() user: User,
  ) {
    return this.likesService.like(user.id, photoId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  unlike(
    @Param('photoId', ParseIntPipe) photoId: number,
    @CurrentUser() user: User,
  ) {
    return this.likesService.unlike(user.id, photoId);
  }

  @Get('count')
  count(@Param('photoId', ParseIntPipe) photoId: number) {
    return this.likesService.countByPhoto(photoId);
  }
}
