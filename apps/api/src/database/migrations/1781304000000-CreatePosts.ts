import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePosts1781304000000 implements MigrationInterface {
  name = 'CreatePosts1781304000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        CONSTRAINT "UQ_tags_name" UNIQUE ("name"),
        CONSTRAINT "PK_tags_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "code" text,
        "thumbnailUrl" character varying,
        "authorId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "search_vector" tsvector GENERATED ALWAYS AS (
          to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(description, ''))
        ) STORED,
        CONSTRAINT "PK_posts_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_posts_search_vector" ON "posts" USING GIN ("search_vector")
    `);

    await queryRunner.query(`
      ALTER TABLE "posts"
        ADD CONSTRAINT "FK_posts_author"
        FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE TABLE "post_tags" (
        "postId" uuid NOT NULL,
        "tagId" uuid NOT NULL,
        CONSTRAINT "PK_post_tags" PRIMARY KEY ("postId", "tagId")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "post_tags"
        ADD CONSTRAINT "FK_post_tags_post"
        FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "post_tags"
        ADD CONSTRAINT "FK_post_tags_tag"
        FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "content" text NOT NULL,
        "authorId" uuid NOT NULL,
        "postId" uuid NOT NULL,
        "parentId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comments_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "comments"
        ADD CONSTRAINT "FK_comments_author"
        FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "comments"
        ADD CONSTRAINT "FK_comments_post"
        FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "comments"
        ADD CONSTRAINT "FK_comments_parent"
        FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE TABLE "post_likes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "postId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_post_likes_user_post" UNIQUE ("userId", "postId"),
        CONSTRAINT "PK_post_likes_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "post_likes"
        ADD CONSTRAINT "FK_post_likes_user"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "post_likes"
        ADD CONSTRAINT "FK_post_likes_post"
        FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "FK_post_likes_post"`);
    await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "FK_post_likes_user"`);
    await queryRunner.query(`DROP TABLE "post_likes"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_parent"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_post"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_author"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_post_tags_tag"`);
    await queryRunner.query(`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_post_tags_post"`);
    await queryRunner.query(`DROP TABLE "post_tags"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_posts_author"`);
    await queryRunner.query(`DROP INDEX "IDX_posts_search_vector"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TABLE "tags"`);
  }
}
