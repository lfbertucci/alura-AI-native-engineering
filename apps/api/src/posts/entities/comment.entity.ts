import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Post } from './post.entity.js';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column()
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  postId: string;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ nullable: true, type: 'uuid' })
  parentId: string | null;

  @ManyToOne(() => Comment, (c) => c.replies, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Comment | null;

  @OneToMany(() => Comment, (c) => c.parent)
  replies: Comment[];

  @CreateDateColumn()
  createdAt: Date;
}
