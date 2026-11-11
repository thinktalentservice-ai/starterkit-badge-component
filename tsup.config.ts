import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  // NOT `treeshake: true`. That option post-processes the bundle through rollup,
  // which strips module-level directives — it silently removes the "use client"
  // banner below. esbuild already tree-shakes when bundling.
  target: "es2020",
  // React is a peer dep — never bundle it, or consumers get two Reacts.
  external: ["react", "react-dom"],
  // esbuild strips top-of-file directives, so "use client" is re-attached to
  // every output chunk. Badge has no handlers today, but a consumer importing it
  // from a client file must not hit a server/client boundary surprise, and
  // forwardRef is not allowed in a server component.
  banner: { js: '"use client";' },
  outExtension: ({ format }) => ({ js: format === "cjs" ? ".cjs" : ".js" }),
});
