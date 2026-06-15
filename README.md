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

## Build

```sh
npm run docs:build
```

## Deployment

The GitHub Actions workflow deploys `docs/.vitepress/dist` to GitHub Pages on
pushes to `main`.

This site is the public entry point. Implementation-level design records remain
in:

```txt
https://github.com/LatticeNet/lattice/tree/main/docs
```
