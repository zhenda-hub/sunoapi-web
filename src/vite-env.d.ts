/// <reference types="vite/client" />

declare const Bun: typeof import('bun') & {
  /**
   * The type of the global `Bun` object.
   */
  global: typeof globalThis & typeof Bun
}
