/// <reference types="vite/client" />

interface ImportMeta {
  readonly glob: (pattern: string, options?: { eager?: boolean; as?: string }) => Record<string, any>;
}
