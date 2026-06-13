import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Post } from '../posts/entities/post.entity.js';
import { Tag } from '../posts/entities/tag.entity.js';
import { Comment } from '../posts/entities/comment.entity.js';
import { PostLike } from '../posts/entities/post-like.entity.js';
import { CreateUsers1781049600000 } from './migrations/1781049600000-CreateUsers.js';
import { CreatePosts1781304000000 } from './migrations/1781304000000-CreatePosts.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'carreira_native_ai',
  entities: [User, Post, Tag, Comment, PostLike],
  migrations: [CreateUsers1781049600000, CreatePosts1781304000000],
  synchronize: false,
});
