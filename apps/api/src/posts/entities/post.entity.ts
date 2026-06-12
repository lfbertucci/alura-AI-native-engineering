import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Tag } from './tag.entity.js';
import type { Comment } from './comment.entity.js';
import type { PostLike } from './post-like.entity.js';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  code: string | null;

  @Column({ nullable: true })
  thumbnailUrl: string | null;

  @Column()
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToMany(() => Tag, { eager: true, cascade: ['insert', 'update'] })
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'postId' },
    inverseJoinColumn: { name: 'tagId' },
  })
  tags: Tag[];

  @OneToMany('Comment', (c: Comment) => c.post)
  comments: Comment[];

  @OneToMany('PostLike', (l: PostLike) => l.post)
  likes: PostLike[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
