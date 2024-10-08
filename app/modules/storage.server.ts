import type { AppLoadContext } from "@remix-run/cloudflare";
import type { Env } from "env.d.ts";

async function getStorageClient(serverContext: AppLoadContext){
    const env = serverContext.cloudflare.env as Env;
    return env.R2;
}

async function listKeysInBucket(serverContext: AppLoadContext){
    const r2 = await getStorageClient(serverContext);
    const list = await r2.list();
    const keys = list.objects.map((object) => object.key);
    return keys;
}

async function putFileToStorage(serverContext: AppLoadContext, fileName: string, file: File): Promise<string>{
    const r2 = await getStorageClient(serverContext);
    console.log(fileName, file);
    const response = await r2.put(fileName, await file.arrayBuffer(), {
        httpMetadata: {
            contentType: file.type,
        },
    });
    return response.key;
}

async function getFileFromStorageByKey(serverContext: AppLoadContext, key: string){
    const r2 = await getStorageClient(serverContext);
    const response = await r2.get(key);
    return response;
}

async function generateFileName(){
    const ymd = new Date().toISOString().split("T")[0];
    const uuid = crypto.randomUUID();
    return `${ymd}-${uuid}`;
}

async function createOGImage(postId: number, tags: string[], postTitle: string, serverContext: AppLoadContext){ 
    const env = serverContext.cloudflare.env as Env;
    const OGIMAGE_GENERATION_ENDPOINT = env.OGIMAGE_GENERATION_ENDPOINT;
    try { 
        console.log("OGIMAGE_GENERATION_ENDPOINT", OGIMAGE_GENERATION_ENDPOINT);
        const res = await fetch(OGIMAGE_GENERATION_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "post_id": postId,
                "post_tags": tags,
                "post_title": postTitle
                })
        });
        console.log("OGImageGenerationResponse", res);
        const data = await res.json() as { status: string, message: string , key: string};
        if (data.status === "success"){
            return data.key;
        }
        throw new Error(data.message);
    } catch (error) {
        console.error(error);
        throw new Error("Failed to create OG image");
    }
}

export { putFileToStorage, getFileFromStorageByKey, listKeysInBucket, generateFileName, createOGImage};