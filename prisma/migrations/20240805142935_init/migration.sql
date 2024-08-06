/*
  Warnings:

  - Added the required column `is_public` to the `dimPosts` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_dimPosts" (
    "post_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "post_title" TEXT NOT NULL,
    "post_unix_time_gmt" INTEGER NOT NULL,
    "post_content_md" TEXT NOT NULL,
    "post_summary" TEXT NOT NULL,
    "post_og_image_url" TEXT NOT NULL,
    "is_public" INTEGER NOT NULL
);
INSERT INTO "new_dimPosts" ("post_content_md", "post_id", "post_og_image_url", "post_summary", "post_title", "post_unix_time_gmt") SELECT "post_content_md", "post_id", "post_og_image_url", "post_summary", "post_title", "post_unix_time_gmt" FROM "dimPosts";
DROP TABLE "dimPosts";
ALTER TABLE "new_dimPosts" RENAME TO "dimPosts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
