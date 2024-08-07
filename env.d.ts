import { R2Bucket } from "@cloudflare/workers-types/experimental";

declare module "__STATIC_CONTENT_MANIFEST" {
  const manifest: string;
  export default manifest;
}

interface Env {
  R2: R2Bucket;
  DB: D1Database;
}

interface ImportMetaEnv {
  MODE: string;
  SESSION_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  ADMIN_USER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}