import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './like.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
  ) {}

  async like(userId: number, photoId: number): Promise<Like> {
    const existing = await this.likesRepository.findOne({
      where: { user_id: userId, photo_id: photoId },
    });
    if (existing) throw new ConflictException('You already liked this photo');

    const like = this.likesRepository.create({
      user_id: userId,
      photo_id: photoId,
    });
    return this.likesRepository.save(like);
  }

  async unlike(userId: number, photoId: number): Promise<void> {
    const like = await this.likesRepository.findOne({
      where: { user_id: userId, photo_id: photoId },
    });
    if (!like) throw new NotFoundException('Like not found');
    await this.likesRepository.remove(like);
  }

  async countByPhoto(photoId: number): Promise<number> {
    return this.likesRepository.count({ where: { photo_id: photoId } });
  }
}
