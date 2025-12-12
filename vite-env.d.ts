// Manually declare vite types to avoid "Cannot find type definition file for 'vite/client'" error
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
