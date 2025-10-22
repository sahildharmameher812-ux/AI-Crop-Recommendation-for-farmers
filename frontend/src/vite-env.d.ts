/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string
  readonly VITE_API_TIMEOUT?: string
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
  readonly VITE_OPENWEATHER_API_KEY?: string
  readonly VITE_DATA_GOV_API_KEY?: string
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
