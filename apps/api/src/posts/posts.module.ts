import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity.js';
import { Tag } from './entities/tag.entity.js';
import { Comment } from './entities/comment.entity.js';
import { PostLike } from './entities/post-like.entity.js';
import { PostsService } from './posts.service.js';
import { PostsController } from './posts.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Tag, Comment, PostLike])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
