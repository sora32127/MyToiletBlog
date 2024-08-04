import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";
import { AppLoadContext } from "@remix-run/server-runtime";
import { getNowUnixTimeGMT } from "./util.server";

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


async function createPost(postTitle: string, postContentMD:string, serverContext: AppLoadContext){
    const db = getDBClient(serverContext);
    const postUnixTimeGMT = await getNowUnixTimeGMT();
    const post = await db.dimPosts.create({
        data: {
            postTitle,
            postContentMD,
            postUnixTimeGMT,
        },
    });
    return post;
}

async function getPost(postId: number, serverContext: AppLoadContext){
    const db = getDBClient(serverContext);
    const post = await db.dimPosts.findUnique({
        where: {
            postId,
        },
    });
    return post;
}

export {createPost, getPost};