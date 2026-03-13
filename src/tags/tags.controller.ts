import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dtos/create-tag.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post('photos/:photoId/tags')
  @UseGuards(JwtAuthGuard)
  addTag(
    @Param('photoId', ParseIntPipe) photoId: number,
    @Body() body: CreateTagDto,
  ) {
    return this.tagsService.addTagToPhoto(photoId, body.tag_name);
  }

  @Get('tags/:name/photos')
  findPhotosByTag(@Param('name') name: string) {
    return this.tagsService.findPhotosByTag(name);
  }

  @Get('tags/trending')
  getTrending() {
    return this.tagsService.getTrending();
  }
}
