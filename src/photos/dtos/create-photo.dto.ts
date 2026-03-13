import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePhotoDto {
  @IsString()
  @IsNotEmpty()
  image_url: string;
}
