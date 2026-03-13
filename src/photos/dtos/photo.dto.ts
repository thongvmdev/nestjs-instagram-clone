import { Expose, Type } from 'class-transformer';

class PhotoUserDto {
  @Expose()
  id: number;

  @Expose()
  username: string;
}

export class PhotoDto {
  @Expose()
  id: number;

  @Expose()
  image_url: string;

  @Expose()
  created_at: Date;

  @Expose()
  user_id: number;

  @Expose()
  @Type(() => PhotoUserDto)
  user: PhotoUserDto;
}
