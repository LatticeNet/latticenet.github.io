/// <reference types="vitepress/client" />

// Without this reference TypeScript has no declaration for `*.vue` or for CSS
// side-effect imports, so the theme entry reports seven phantom "cannot find
// module" errors even though the build is fine. The build was never the thing
// at risk — the editor and any future typecheck were.
