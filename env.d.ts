/// <reference types="vite/client" />

// Make unknown `import.meta.env` keys a type error instead of `any`
interface ViteTypeOptions {
    strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_SOCKET_URL: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_VERSION: string;
    readonly VITE_APP_ENV: string;
}
