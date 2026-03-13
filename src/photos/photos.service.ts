import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private readonly photosRepository: Repository<Photo>,
  ) {}

  async create(imageUrl: string, userId: number): Promise<Photo> {
    const photo = this.photosRepository.create({
      image_url: imageUrl,
      user_id: userId,
    });
    return this.photosRepository.save(photo);
  }

  async findOne(id: number): Promise<Photo> {
    const photo = await this.photosRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!photo) throw new NotFoundException(`Photo #${id} not found`);
    return photo;
  }

  async findAll(): Promise<Photo[]> {
    return this.photosRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async findByUser(userId: number): Promise<Photo[]> {
    return this.photosRepository.find({
      where: { user_id: userId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async remove(id: number, currentUserId: number): Promise<Photo> {
    const photo = await this.findOne(id);
    if (photo.user_id !== currentUserId) {
      throw new ForbiddenException('You can only delete your own photos');
    }
    return this.photosRepository.remove(photo);
  }
}
