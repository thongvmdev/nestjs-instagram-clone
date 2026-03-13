import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  created_at: Date;
}

export class UserProfileDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  created_at: Date;

  @Expose()
  photo_count: number;

  @Expose()
  follower_count: number;

  @Expose()
  following_count: number;
}
