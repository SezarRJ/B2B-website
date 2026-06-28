// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    // Lovable's default config opts into Lightning CSS. That is normally fine,
    // but this app uses Tailwind v4's CSS-first directives (`@theme`, source
    // hints, etc.), and Lightning can see those directives before Tailwind has
    // expanded them during dev/preview. Keep Vite on the PostCSS pipeline for
    // CSS transforms and use esbuild for CSS minification so Tailwind owns its
    // at-rules and the preview/dev logs stay clean.
    css: {
      transformer: "postcss",
    },
    build: {
      cssMinify: "esbuild",
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
