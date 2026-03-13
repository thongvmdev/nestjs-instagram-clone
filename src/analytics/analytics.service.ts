import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(private readonly dataSource: DataSource) {}

  async getOldestUsers() {
    return this.dataSource
      .createQueryBuilder()
      .select('u.id', 'id')
      .addSelect('u.username', 'username')
      .addSelect('u.created_at', 'created_at')
      .from('users', 'u')
      .orderBy('u.created_at', 'ASC')
      .limit(5)
      .getRawMany();
  }

  async getPopularSignupDay() {
    return this.dataSource
      .createQueryBuilder()
      .select('DAYNAME(u.created_at)', 'day')
      .addSelect('COUNT(*)', 'count')
      .from('users', 'u')
      .groupBy('day')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawMany();
  }

  async getInactiveUsers() {
    return this.dataSource
      .createQueryBuilder()
      .select('u.id', 'id')
      .addSelect('u.username', 'username')
      .from('users', 'u')
      .leftJoin('photos', 'p', 'p.user_id = u.id')
      .where('p.id IS NULL')
      .getRawMany();
  }

  async getMostLikedPhoto() {
    return this.dataSource
      .createQueryBuilder()
      .select('p.id', 'photo_id')
      .addSelect('p.image_url', 'image_url')
      .addSelect('u.username', 'username')
      .addSelect('COUNT(l.user_id)', 'like_count')
      .from('photos', 'p')
      .innerJoin('users', 'u', 'u.id = p.user_id')
      .leftJoin('likes', 'l', 'l.photo_id = p.id')
      .groupBy('p.id')
      .orderBy('like_count', 'DESC')
      .limit(1)
      .getRawMany();
  }

  async getAvgPostsPerUser(): Promise<unknown[]> {
    const result: unknown[] = await this.dataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM photos) / (SELECT COUNT(*) FROM users) AS avg_posts
    `);
    return result;
  }

  async getTopHashtags() {
    return this.dataSource
      .createQueryBuilder()
      .select('t.tag_name', 'tag_name')
      .addSelect('COUNT(pt.photo_id)', 'count')
      .from('tags', 't')
      .innerJoin('photo_tags', 'pt', 'pt.tag_id = t.id')
      .groupBy('t.id')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getBotAccounts(): Promise<unknown[]> {
    return this.dataSource.query(`
      SELECT u.id, u.username, COUNT(l.photo_id) AS like_count
      FROM users u
      INNER JOIN likes l ON l.user_id = u.id
      GROUP BY u.id
      HAVING like_count = (SELECT COUNT(*) FROM photos)
    `);
  }
}
