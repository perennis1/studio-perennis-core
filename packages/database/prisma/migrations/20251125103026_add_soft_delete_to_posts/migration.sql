-- add_soft_delete_to_posts

ALTER TABLE "Post"
ADD COLUMN "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deletedAt" TIMESTAMP;
