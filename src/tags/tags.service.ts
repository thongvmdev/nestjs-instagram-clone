import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';
import { Photo } from '../photos/photo.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
    @InjectRepository(Photo)
    private readonly photosRepository: Repository<Photo>,
  ) {}

  async findOrCreate(tagName: string): Promise<Tag> {
    let tag = await this.tagsRepository.findOne({
      where: { tag_name: tagName },
    });
    if (!tag) {
      tag = this.tagsRepository.create({ tag_name: tagName });
      tag = await this.tagsRepository.save(tag);
    }
    return tag;
  }

  async addTagToPhoto(photoId: number, tagName: string): Promise<Photo> {
    const photo = await this.photosRepository.findOne({
      where: { id: photoId },
      relations: ['tags'],
    });
    if (!photo) throw new NotFoundException(`Photo #${photoId} not found`);

    const tag = await this.findOrCreate(tagName);
    const alreadyTagged = photo.tags.some((t) => t.id === tag.id);
    if (!alreadyTagged) {
      photo.tags.push(tag);
      await this.photosRepository.save(photo);
    }

    return photo;
  }

  async findPhotosByTag(tagName: string): Promise<Photo[]> {
    const tag = await this.tagsRepository.findOne({
      where: { tag_name: tagName },
    });
    if (!tag) throw new NotFoundException(`Tag "${tagName}" not found`);

    return this.photosRepository
      .createQueryBuilder('photo')
      .innerJoin('photo.tags', 'tag', 'tag.id = :tagId', { tagId: tag.id })
      .leftJoinAndSelect('photo.user', 'user')
      .orderBy('photo.created_at', 'DESC')
      .getMany();
  }

  async getTrending(limit = 5): Promise<{ tag_name: string; count: string }[]> {
    return this.tagsRepository
      .createQueryBuilder('tag')
      .innerJoin('photo_tags', 'pt', 'pt.tag_id = tag.id')
      .select('tag.tag_name', 'tag_name')
      .addSelect('COUNT(pt.photo_id)', 'count')
      .groupBy('tag.id')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
