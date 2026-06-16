# LatticeNet Website

Public website and documentation entry point for the LatticeNet organization.

Default GitHub Pages URL:

```txt
https://latticenet.github.io/
```

## Development

```sh
npm install
npm run docs:dev
```

The homepage generates a deterministic bitmap hero asset before dev/build.

## Build

```sh
npm test
npm run docs:build
```

`npm test` runs content consistency checks before the VitePress build. Those
checks intentionally guard project facts that tend to drift: Docker server
deployment, GitHub Release agent binaries, target-bound agent updates, and the
plugin marketplace safety boundary.

## Deployment

The GitHub Actions workflow deploys `docs/.vitepress/dist` to GitHub Pages on
pushes to `main`.

This site is the public entry point. Implementation-level design records remain
in:

```txt
https://github.com/LatticeNet/lattice/tree/main/docs
```
