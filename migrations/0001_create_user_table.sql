-- CreateTable
CREATE TABLE "dimPosts" (
    "post_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "post_title" TEXT NOT NULL,
    "post_unix_time_gmt" INTEGER NOT NULL,
    "post_content_md" TEXT NOT NULL,
    "post_summary" TEXT NOT NULL,
    "post_og_image_url" TEXT NOT NULL,
    "is_public" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "relPostTags" (
    "rel_post_tags_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "post_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    CONSTRAINT "relPostTags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "dimPosts" ("post_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "relPostTags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "dimTags" ("tag_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dimTags" (
    "tag_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tag_name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "dimTags_tag_name_key" ON "dimTags"("tag_name");

