# @mijoco/stx_helpers

Helper functions common to stxeco and other applications

## Creating a project

```bash
npm init -y
npm install typescript --save-dev
npm install ts-node --save-dev
npm install tslib --save-dev
npm install @types/node --save-dev
```

## Publishing

To publish your library to [npm](https://www.npmjs.com):

```bash
npm publish --access public
```

## Packing

Test the helpers prior to publishing.

```bash
npm run build
npm pack
mv mijoco-stxeco_helpers-0.0.xx.tgz ../stxeco-launcher
```

in stxeco-launcher;

```bash
npm install ./mijoco-stxeco_helpers-0.0.xx.tgz
```
