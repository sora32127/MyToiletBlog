import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";
import { AppLoadContext } from "@remix-run/server-runtime";
import { getNowUnixTimeGMT } from "./util.server";
import { z } from "zod";
import { createOGImage } from "./storage.server";

interface Env {
    DB: D1Database;
}

declare global {
    var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient | undefined;

function createPrismaClient(env: Env): PrismaClient {
    const environment = import.meta.env.MODE;
    if (environment === "production"){
        const adapter = new PrismaD1(env.DB);
        return new PrismaClient({ adapter });
    }
    else {
        // 開発環境の場合はローカルのsqliteファイルを使用する。ローカル開発環境のファイルパスは./prisma/schema.prismaに記載されているので、通常のPrismaClientをInstantiateするとその設定が有効になる。
        // Cloudflareのwranglerでは、ローカル開発時にwrangler用のSQLiteをエミュレートするが、その設定ではインタラクティブシェルが使えないので、開発体験があまり良くない
        // そのため、開発環境でPrismaClientをInstantiateするときには、ローカルのsqliteファイルを使用する
        return new PrismaClient();
    }
}

function getDBClient(serverContext: AppLoadContext): PrismaClient {
    if (prisma) {
        return prisma;
    }

    const env = serverContext.cloudflare.env as Env;
    const environment = import.meta.env.MODE;
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

function validatePostContent(postTitle: string, tagsArray: string[]){
    if (postTitle.length > 40){
        return {
            status: 400,
            message: "タイトルの文字数が40文字を超えています"
        };
    }
    if (tagsArray.length > 5){
        return {
            status: 400,
            message: "タグの数が5つを超えています"
        };
    }
    return {
        status: 200,
        message: "Valid post content"
    };
}

async function createPost(postTitle: string, postContentMD:string, tags: string, isPublic: String, summary: string, postId:number | null = null, serverContext: AppLoadContext){
    const tagsArray = tags.split(" ").map((tagName) => tagName.replace("#", "")).filter((tagName) => tagName !== "");
    const isValidPostContent = validatePostContent(postTitle, tagsArray);
    if (isValidPostContent.status !== 200){
        return isValidPostContent;
    }

    const db = getDBClient(serverContext);
    const postUnixTimeGMT = await getNowUnixTimeGMT();
    const isPublicInt = isPublic === "true" ? 1 : 0;
    if (postId){
        const post = await db.dimPosts.update({
            where: {
                postId
            },
            data: {
                postTitle,
                postContentMD,
                postUnixTimeGMT,
                postSummary: summary,
                postOGImageURL: "",
                isPublic: isPublicInt,
            }
        })
    }
    else {
        const post = await db.dimPosts.create({
            data: {
                postTitle,
            postContentMD,
            postUnixTimeGMT,
            postSummary: summary,
            postOGImageURL: "",
            isPublic: isPublicInt,
        },
    });
    // tagNameに\sが含まれている場合は、\sを除去してからタグを作成する
    tagsArray.forEach(async (tagName) => {
        let tagId = await db.dimTags.findUnique({
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
            tagId = {"tagId": newTag.tagId};
        }
        await db.relPostTags.create({
            data: {
                postId: post.postId,
                tagId: tagId.tagId
            }
        })
    })
    const ogImageKey = await createOGImage(post.postId, tagsArray, postTitle, serverContext);
    console.log("OGImagekey", ogImageKey)
    await db.dimPosts.update({
        where: {
            postId: post.postId
        },
        data: {
            postOGImageURL: `https://contradictiononline.org/images/${ogImageKey}`
        }
    })
    return {
        post,
        status: 200,
        message: "Created"
    };
}}

async function getPostByPostId(postId: number, serverContext: AppLoadContext, isEditPage: boolean = false){
    const db = getDBClient(serverContext);
    if (isEditPage){
        const post = await db.dimPosts.findUnique({
            where: {
            postId,
        },
        })
        return post;
    }
    else {
        const post = await db.dimPosts.findUnique({
            where: {
                postId,
                isPublic: 1
            },
        })
        return post;
    }
}

const tagSchema = z.object({
    tagName: z.string(),
    tagId: z.number(),
});

export type TagSchemaType = z.infer<typeof tagSchema>

async function getTagsByPostId(postId: number, serverContext: AppLoadContext): Promise<z.infer<typeof tagSchema>[]> {
    const db = getDBClient(serverContext);
    const tagIds = await db.relPostTags.findMany({
        where: {
            postId,
        },
        select: {
            tagId: true
        }
    });
    const tagNamesRaw = await db.dimTags.findMany({
        where: {
            tagId: {
                in: tagIds.map((tagId) => tagId.tagId)
            }
        },
        select: {
            tagName: true,
            tagId: true
        }
    });
    const tagNames = tagNamesRaw.map((tag) => {
        return {
            tagName: tag.tagName,
            tagId: tag.tagId
        }
    });
    return tagNames;
}

export type PostShowCardSchemaType = z.infer<typeof PostShowCardSchema>
const PostShowCardSchema = z.optional(z.object({
    postId: z.number(),
    postTitle: z.string(),
    postContentMD: z.string(),
    postUnixTimeGMT: z.number(),
    postSummary: z.string(),
    postOGImageURL: z.string(),
    isPublic: z.number(),
    tagsNames: z.array(tagSchema),
}))

async function getRecentPosts(serverContext: AppLoadContext): Promise<z.infer<typeof PostShowCardSchema>[]> {
    const db = getDBClient(serverContext);
    const posts = await db.dimPosts.findMany({
        orderBy: {
            postUnixTimeGMT: "desc",
        },
        where: {
            isPublic: 1
        },
        take: 10,
    });
    const postsWithTags = await Promise.all(posts.map(async (post) => {
        const tags = await getTagsByPostId(post.postId, serverContext);
        return {
            ...post,
            tagsNames: tags
        }
    }));
    return postsWithTags;
}

async function getPostsByTagName(tagName: string, serverContext: AppLoadContext): Promise<z.infer<typeof PostShowCardSchema>[]> {
    const db = getDBClient(serverContext);
    const tagId = await db.dimTags.findUnique({
        where: {
            tagName
        }
    });
    if (!tagId){
        return [];
    }
    const posts = await db.dimPosts.findMany({
        where: {
            relPostTags: {
                some: {
                    tagId: tagId.tagId
                }
            },
            isPublic: 1
        }
    });
    const postsWithTags = await Promise.all(posts.map(async (post) => {
        const tags = await getTagsByPostId(post.postId, serverContext);
        return {
            ...post,
            tagsNames: tags
        }
    }));
    return postsWithTags;
}

async function getTagCounts(serverContext: AppLoadContext): Promise<{tagName: string, count: number}[]> {
    const db = getDBClient(serverContext);
    const tagCountsById = await db.relPostTags.groupBy({
        by: ["tagId"],
        _count: true
    })
    const tagIdNameMapping = await db.dimTags.findMany({
        where: {
            tagId: {
                in: tagCountsById.map((tagCount) => tagCount.tagId)
            }
        },
        select: {
            tagId: true,
            tagName: true
        }
    })
    const tagCounts = tagCountsById.map((tagCount) => {
        const tagName = tagIdNameMapping.find((tag) => tag.tagId === tagCount.tagId)?.tagName;
        if (!tagName){
            return;
        }
        return {
            tagName,
            count: tagCount._count
        }
    })
    return tagCounts.filter((tagCount) => tagCount !== undefined) as {tagName: string, count: number}[];
}

async function getPostsInBackList(serverContext: AppLoadContext): Promise<z.infer<typeof PostShowCardSchema>[]> {
    const db = getDBClient(serverContext);
    const posts = await db.dimPosts.findMany({
        orderBy: {
            postUnixTimeGMT: "desc",
        },
        take: 10,
    });
    const postsWithTags = await Promise.all(posts.map(async (post) => {
        const tags = await getTagsByPostId(post.postId, serverContext);
        return {
            ...post,
            tagsNames: tags
        }
    }));
    return postsWithTags;
}

export async function deletePosts(postIds: number[], serverContext: AppLoadContext){
    const db = getDBClient(serverContext);
    await db.dimPosts.deleteMany({
        where: {
            postId: {
                in: postIds
            }
        }
    })
    return "success";
}

export async function getPostsInSitemap(serverContext: AppLoadContext){
    const db = getDBClient(serverContext);
    const posts = await db.dimPosts.findMany({
        where: {
            isPublic: 1
        }
    })
    return posts;
}


export {createPost, getPostByPostId, getRecentPosts, getTagsByPostId, getPostsByTagName, getTagCounts, getPostsInBackList};