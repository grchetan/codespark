/// <reference types="vite/client" />

interface ImportMeta {
  readonly glob: (pattern: string, options?: { eager?: boolean; as?: string }) => Record<string, any>;
}

interface AppBuildInfo {
  version: string;
  commit: string;
  message: string;
  buildTime: number;
  releaseDate?: string;
  timestamp?: string;
}

declare const __BASE_PATH__: string;
declare const __APP_BUILD_INFO__: AppBuildInfo;

