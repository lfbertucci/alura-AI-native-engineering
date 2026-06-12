import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { GetPostsQueryDto } from './dto/get-posts-query.dto.js';

@ApiTags('posts')
@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('posts')
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @Query() query: GetPostsQueryDto,
    @CurrentUser() user?: { userId: string },
  ) {
    return this.postsService.findAll(query, user?.userId);
  }

  @Get('posts/:id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user?: { userId: string },
  ) {
    return this.postsService.findOne(id, user?.userId);
  }

  @Post('posts')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Apenas imagens são permitidas'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const thumbnailUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.postsService.create(user.userId, dto, thumbnailUrl);
  }

  @Post('posts/:id/likes')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  like(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.postsService.like(id, user.userId);
  }

  @Delete('posts/:id/likes')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async unlike(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    await this.postsService.unlike(id, user.userId);
  }

  @Post('posts/:id/comments')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addComment(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateCommentDto,
  ) {
    return this.postsService.addComment(id, user.userId, dto);
  }

  @Get('tags')
  findTags() {
    return this.postsService.findTags();
  }
}
