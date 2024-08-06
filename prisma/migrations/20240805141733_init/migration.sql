/*
  Warnings:

  - The primary key for the `dimPosts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `postContentMD` on the `dimPosts` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `dimPosts` table. All the data in the column will be lost.
  - You are about to drop the column `postTitle` on the `dimPosts` table. All the data in the column will be lost.
  - You are about to drop the column `postUnixTimeGMT` on the `dimPosts` table. All the data in the column will be lost.
  - Added the required column `post_content_md` to the `dimPosts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `post_id` to the `dimPosts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `post_title` to the `dimPosts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `post_unix_time_gmt` to the `dimPosts` table without a default value. This is not possible if the table is not empty.

*/
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

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_dimPosts" (
    "post_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "post_title" TEXT NOT NULL,
    "post_unix_time_gmt" INTEGER NOT NULL,
    "post_content_md" TEXT NOT NULL
);
DROP TABLE "dimPosts";
ALTER TABLE "new_dimPosts" RENAME TO "dimPosts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
