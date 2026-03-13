import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller()
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post('follows/:userId')
  @UseGuards(JwtAuthGuard)
  follow(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
  ) {
    return this.followsService.follow(user.id, userId);
  }

  @Delete('follows/:userId')
  @UseGuards(JwtAuthGuard)
  unfollow(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
  ) {
    return this.followsService.unfollow(user.id, userId);
  }

  @Get('users/:id/followers')
  getFollowers(@Param('id', ParseIntPipe) id: number) {
    return this.followsService.getFollowers(id);
  }

  @Get('users/:id/following')
  getFollowing(@Param('id', ParseIntPipe) id: number) {
    return this.followsService.getFollowing(id);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  getFeed(@CurrentUser() user: User) {
    return this.followsService.getFeed(user.id);
  }
}
