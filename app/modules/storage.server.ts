import { AppLoadContext } from "@remix-run/cloudflare";

interface Env {
    R2: R2Bucket;
}

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

export { putFileToStorage, getFileFromStorageByKey, listKeysInBucket, generateFileName};