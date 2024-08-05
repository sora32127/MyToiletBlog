import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";
import { AppLoadContext } from "@remix-run/server-runtime";
import { getNowUnixTimeGMT } from "./util.server";
import { z } from "zod";

interface Env {
    DB: D1Database;
}

declare global {
    var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient | undefined;

function createPrismaClient(env: Env): PrismaClient {
    const adapter = new PrismaD1(env.DB);
    return new PrismaClient({ adapter });
}
function getDBClient(serverContext: AppLoadContext): PrismaClient {
    if (prisma) {
        return prisma;
    }

    const env = serverContext.cloudflare.env as Env;
    prisma = createPrismaClient(env);

    // 開発環境でのホットリロード対策
    if (import.meta.env.MODE !== "production") {
        global.__prisma = prisma;
    }
    return prisma;
}

// 開発環境での再利用
if (import.meta.env.MODE !== "production" && global.__prisma) {
    prisma = global.__prisma;
}


async function createPost(postTitle: string, postContentMD:string, tags: string, isPublic: String, summary: string, serverContext: AppLoadContext){
    console.log(tags);
    const db = getDBClient(serverContext);
    const postUnixTimeGMT = await getNowUnixTimeGMT();
    // #生活 #人間　→　["生活", "人間"]
    const tagsArray = tags.split(" ").map((tagName) => tagName.replace("#", ""));
    console.log(tagsArray);
    const isPublicInt = isPublic === "true" ? 1 : 0;
    tagsArray.forEach(async (tagName) => {
        let tagId = await db.dimTags.findUniqueOrThrow({
            select: {
                tagId: true
            },
            where : {
                tagName
            }
        })
        if (!tagId){
            const newTag = await db.dimTags.create({
                data: {
                    tagName
                }
            })
            tagId = newTag.tagId;
        }
        await db.relPostTags.create({
            data: {
                postId: post.postId,
                tagId: tagId
            }
        })
    })



    const post = await db.dimPosts.create({
        data: {
            postTitle,
            postContentMD,
            postUnixTimeGMT,
            postSummary: summary,
            postOGImageURL: "",
        },
    });
    return post;
}

async function getPostByPostId(postId: number, serverContext: AppLoadContext){
    const db = getDBClient(serverContext);
    const post = await db.dimPosts.findUnique({
        where: {
            postId,
        },
    });
    return post;
}

export const postSchema = z.object({
    postId: z.number(),
    postTitle: z.string(),
    postContentMD: z.string(),
    postUnixTimeGMT: z.number(),
});

async function getRecentPosts(serverContext: AppLoadContext): Promise<z.infer<typeof postSchema>[]> {
    const db = getDBClient(serverContext);
    const posts = await db.dimPosts.findMany({
        orderBy: {
            postUnixTimeGMT: "desc",
        },
        take: 10,
    });
    return posts;
}
export {createPost, getPostByPostId, getRecentPosts};