import { R2Bucket } from "@cloudflare/workers-types/experimental";

declare module "__STATIC_CONTENT_MANIFEST" {
  const manifest: string;
  export default manifest;
}

interface Env {
  R2: R2Bucket;
}