import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './follow.entity';
import { Photo } from '../photos/photo.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
    @InjectRepository(Photo)
    private readonly photosRepository: Repository<Photo>,
  ) {}

  async follow(followerId: number, followeeId: number): Promise<Follow> {
    if (followerId === followeeId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existing = await this.followsRepository.findOne({
      where: { follower_id: followerId, followee_id: followeeId },
    });
    if (existing) throw new ConflictException('Already following this user');

    const follow = this.followsRepository.create({
      follower_id: followerId,
      followee_id: followeeId,
    });
    return this.followsRepository.save(follow);
  }

  async unfollow(followerId: number, followeeId: number): Promise<void> {
    const follow = await this.followsRepository.findOne({
      where: { follower_id: followerId, followee_id: followeeId },
    });
    if (!follow) throw new NotFoundException('Follow relationship not found');
    await this.followsRepository.remove(follow);
  }

  async getFollowers(userId: number): Promise<Follow[]> {
    return this.followsRepository.find({
      where: { followee_id: userId },
      relations: ['follower'],
    });
  }

  async getFollowing(userId: number): Promise<Follow[]> {
    return this.followsRepository.find({
      where: { follower_id: userId },
      relations: ['followee'],
    });
  }

  async getFeed(userId: number): Promise<Photo[]> {
    return this.photosRepository
      .createQueryBuilder('photo')
      .innerJoin('follows', 'f', 'f.followee_id = photo.user_id')
      .leftJoinAndSelect('photo.user', 'user')
      .where('f.follower_id = :userId', { userId })
      .orderBy('photo.created_at', 'DESC')
      .limit(50)
      .getMany();
  }
}
