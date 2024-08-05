import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getFileFromStorageByKey } from "~/modules/storage.server";

export async function loader({ params, context }: LoaderFunctionArgs) {
    const key = params.key;
    if(!key){
        return json({ message: "Key is required", object: {}, status: 400 });
    }
    
    const response = await getFileFromStorageByKey(context, key);

    if(!response){
        return json({ message: "File not found", object: {}, status: 404 });
    }
    console.log(response);

    const headers: HeadersInit = new Headers();
    response.writeHttpMetadata(headers);
    headers.set("etag", response.httpEtag);

    return new Response(response.body, { headers });
}