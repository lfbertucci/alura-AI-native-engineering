import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PostsModule } from './posts/posts.module.js';
import { User } from './users/entities/user.entity.js';
import { Post } from './posts/entities/post.entity.js';
import { Tag } from './posts/entities/tag.entity.js';
import { Comment } from './posts/entities/comment.entity.js';
import { PostLike } from './posts/entities/post-like.entity.js';
import { CreateUsers1781049600000 } from './database/migrations/1781049600000-CreateUsers.js';
import { CreatePosts1781304000000 } from './database/migrations/1781304000000-CreatePosts.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER', 'postgres'),
        password: config.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: config.get<string>('DATABASE_NAME', 'carreira_native_ai'),
        entities: [User, Post, Tag, Comment, PostLike],
        migrations: [CreateUsers1781049600000, CreatePosts1781304000000],
        synchronize: false,
        migrationsRun: true,
      }),
    }),
    UsersModule,
    AuthModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
