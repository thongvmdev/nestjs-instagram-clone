import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Photo } from '../photos/photo.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tag_name: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToMany(() => Photo, (photo) => photo.tags)
  photos: Photo[];
}
