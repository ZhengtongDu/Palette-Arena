/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LEANCLOUD_APP_ID: string;
  readonly VITE_LEANCLOUD_APP_KEY: string;
  readonly VITE_LEANCLOUD_SERVER_URL: string;
  readonly VITE_SMMS_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
