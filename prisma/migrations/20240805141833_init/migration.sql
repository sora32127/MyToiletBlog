/*
  Warnings:

  - A unique constraint covering the columns `[tag_name]` on the table `dimTags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "dimTags_tag_name_key" ON "dimTags"("tag_name");
