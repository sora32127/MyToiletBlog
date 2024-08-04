-- CreateTable
CREATE TABLE "dimPosts" (
    "postId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postTitle" TEXT NOT NULL,
    "postUnixTimeGMT" INTEGER NOT NULL,
    "postContentMD" TEXT NOT NULL
);
