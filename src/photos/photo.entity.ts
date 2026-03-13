import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Comment } from '../comments/comment.entity';
import { Like } from '../likes/like.entity';
import { Tag } from '../tags/tag.entity';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  image_url: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @OneToMany(() => Comment, (comment) => comment.photo)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.photo)
  likes: Like[];

  @ManyToMany(() => Tag, (tag) => tag.photos)
  @JoinTable({
    name: 'photo_tags',
    joinColumn: { name: 'photo_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
