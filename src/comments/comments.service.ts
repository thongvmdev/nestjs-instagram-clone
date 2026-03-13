import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async create(
    commentText: string,
    userId: number,
    photoId: number,
  ): Promise<Comment> {
    const comment = this.commentsRepository.create({
      comment_text: commentText,
      user_id: userId,
      photo_id: photoId,
    });
    return this.commentsRepository.save(comment);
  }

  async findByPhoto(photoId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { photo_id: photoId },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }

  async remove(id: number, currentUserId: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!comment) throw new NotFoundException(`Comment #${id} not found`);
    if (comment.user_id !== currentUserId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    return this.commentsRepository.remove(comment);
  }
}
