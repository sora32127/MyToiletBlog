import { json } from "@remix-run/cloudflare";
import { getFileFromStorageByKey } from "~/modules/storage.server";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ params, context }: LoaderFunctionArgs) {
    const key = params.key;
    if(!key){
        return json({ message: "Key is required", object: {}, status: 400 });
    }
    
    const response = await getFileFromStorageByKey(context, key);

    if(!response){
        return json({ message: "File not found", object: {}, status: 404 });
    }

    const headers = new Headers();
    // @ts-ignore
    response.writeHttpMetadata(headers);
    headers.set("etag", response.httpEtag);
    // @ts-ignore
    return new Response(response.body, { headers });
}