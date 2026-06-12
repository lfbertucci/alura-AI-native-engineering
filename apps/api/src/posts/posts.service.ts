import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';

export interface CommentResult {
  id: string;
  content: string;
  author: { id: string; name: string; handle: string };
  createdAt: Date;
  replies: CommentResult[];
}
import { Post } from './entities/post.entity.js';
import { Tag } from './entities/tag.entity.js';
import { Comment } from './entities/comment.entity.js';
import { PostLike } from './entities/post-like.entity.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { GetPostsQueryDto } from './dto/get-posts-query.dto.js';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
    @InjectRepository(PostLike) private readonly likeRepo: Repository<PostLike>,
  ) {}

  async findAll(query: GetPostsQueryDto, userId?: string) {
    const { search, tags: tagNames, page = 1, limit = 10 } = query;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.author', 'author')
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere(
        `"post"."search_vector" @@ plainto_tsquery('portuguese', :search)`,
        { search },
      );
    }

    if (tagNames?.length) {
      qb.andWhere(
        `post.id IN (
          SELECT pt."postId" FROM post_tags pt
          INNER JOIN tags t ON t.id = pt."tagId"
          WHERE t.name IN (:...tagNames)
        )`,
        { tagNames },
      );
    }

    const [posts, total] = await qb.getManyAndCount();

    if (!posts.length) {
      return { data: [], total: 0, page, limit };
    }

    const postIds = posts.map((p) => p.id);

    const [likeCounts, commentCounts] = await Promise.all([
      this.likeRepo
        .createQueryBuilder('like')
        .select('"like"."postId"', 'postId')
        .addSelect('COUNT(*)', 'count')
        .where('"like"."postId" IN (:...postIds)', { postIds })
        .groupBy('"like"."postId"')
        .getRawMany<{ postId: string; count: string }>(),
      this.commentRepo
        .createQueryBuilder('comment')
        .select('"comment"."postId"', 'postId')
        .addSelect('COUNT(*)', 'count')
        .where('"comment"."postId" IN (:...postIds)', { postIds })
        .groupBy('"comment"."postId"')
        .getRawMany<{ postId: string; count: string }>(),
    ]);

    const likeMap = new Map(likeCounts.map((r) => [r.postId, Number(r.count)]));
    const commentMap = new Map(
      commentCounts.map((r) => [r.postId, Number(r.count)]),
    );

    let likedSet = new Set<string>();
    if (userId) {
      const liked = await this.likeRepo
        .createQueryBuilder('like')
        .select('"like"."postId"', 'postId')
        .where('"like"."userId" = :userId', { userId })
        .andWhere('"like"."postId" IN (:...postIds)', { postIds })
        .getRawMany<{ postId: string }>();
      likedSet = new Set(liked.map((l) => l.postId));
    }

    return {
      data: posts.map((post) =>
        this.mapToListDto(
          post,
          likeMap.get(post.id) ?? 0,
          commentMap.get(post.id) ?? 0,
          likedSet.has(post.id),
        ),
      ),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId?: string) {
    const post = await this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.id = :id', { id })
      .getOne();

    if (!post) throw new NotFoundException('Post não encontrado');

    const [likeCount, commentCount] = await Promise.all([
      this.likeRepo.count({ where: { postId: id } }),
      this.commentRepo.count({ where: { postId: id } }),
    ]);

    let likedByMe = false;
    if (userId) {
      const like = await this.likeRepo.findOne({
        where: { postId: id, userId },
      });
      likedByMe = !!like;
    }

    const topLevel = await this.commentRepo.find({
      where: { postId: id, parentId: IsNull() },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });

    let replies: Comment[] = [];
    if (topLevel.length) {
      replies = await this.commentRepo.find({
        where: { parentId: In(topLevel.map((c) => c.id)) },
        relations: ['author'],
        order: { createdAt: 'ASC' },
      });
    }

    const replyMap = new Map<string, Comment[]>();
    replies.forEach((r) => {
      const pid = r.parentId!;
      if (!replyMap.has(pid)) replyMap.set(pid, []);
      replyMap.get(pid)!.push(r);
    });

    return {
      ...this.mapToListDto(post, likeCount, commentCount, likedByMe),
      code: post.code,
      comments: topLevel.map((c) => this.mapComment(c, replyMap.get(c.id) ?? [])),
    };
  }

  async create(authorId: string, dto: CreatePostDto, thumbnailUrl?: string) {
    const tags = await this.findOrCreateTags(dto.tags ?? []);

    const post = this.postRepo.create({
      title: dto.title,
      description: dto.description,
      code: dto.code ?? null,
      thumbnailUrl: thumbnailUrl ?? null,
      authorId,
      tags,
    });

    const saved = await this.postRepo.save(post);
    return this.findOne(saved.id, authorId);
  }

  async like(postId: string, userId: string) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post não encontrado');

    const existing = await this.likeRepo.findOne({ where: { postId, userId } });
    if (existing) throw new ConflictException('Post já curtido');

    await this.likeRepo.save(this.likeRepo.create({ postId, userId }));
  }

  async unlike(postId: string, userId: string) {
    const like = await this.likeRepo.findOne({ where: { postId, userId } });
    if (!like) throw new NotFoundException('Like não encontrado');
    await this.likeRepo.remove(like);
  }

  async addComment(postId: string, userId: string, dto: CreateCommentDto) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post não encontrado');

    if (dto.parentId) {
      const parent = await this.commentRepo.findOne({
        where: { id: dto.parentId, postId },
      });
      if (!parent) throw new NotFoundException('Comentário pai não encontrado');
    }

    const comment = await this.commentRepo.save(
      this.commentRepo.create({
        content: dto.content,
        authorId: userId,
        postId,
        parentId: dto.parentId ?? null,
      }),
    );

    const withAuthor = await this.commentRepo.findOne({
      where: { id: comment.id },
      relations: ['author'],
    });

    return this.mapComment(withAuthor!, []);
  }

  async findTags() {
    return this.tagRepo.find({ order: { name: 'ASC' } });
  }

  private async findOrCreateTags(names: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];
    for (const name of names) {
      let tag = await this.tagRepo.findOne({ where: { name } });
      if (!tag) {
        tag = await this.tagRepo.save(this.tagRepo.create({ name }));
      }
      tags.push(tag);
    }
    return tags;
  }

  private mapToListDto(
    post: Post,
    likes: number,
    comments: number,
    likedByMe: boolean,
  ) {
    return {
      id: post.id,
      title: post.title,
      description: post.description,
      thumbnailUrl: post.thumbnailUrl,
      tags: post.tags?.map((t) => ({ id: t.id, name: t.name })) ?? [],
      author: {
        id: post.author.id,
        name: post.author.name,
        handle: '@' + post.author.email.split('@')[0],
      },
      counts: { likes, comments },
      likedByMe,
      createdAt: post.createdAt,
    };
  }

  private mapComment(comment: Comment, replies: Comment[]): CommentResult {
    return {
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.author.id,
        name: comment.author.name,
        handle: '@' + comment.author.email.split('@')[0],
      },
      createdAt: comment.createdAt,
      replies: replies.map((r) => this.mapComment(r, [])),
    };
  }
}
