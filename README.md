# a11y-settings

`a11y-settings` is an accessibility overlay widget that adds user-controlled accessibility adjustments to any web page.

## Features

- Color contrast presets
- Font style adjustments
- Font size controls
- Focus visibility toggle
- Link and button highlighting
- Text alignment controls

## Install

```bash
npm install @tekvision/a11y-settings jquery
```

`jquery` is required because internal widget handlers use jQuery APIs.

## Use In A Bundler App (Vite, Webpack, Next)

Import once in your app entry so the widget mounts on page load:

```js
import "@tekvision/a11y-settings";
```

The package entry imports both:

- `ada_overlay.js`
- `ada_overlay.css`

If you only need the style file explicitly:

```js
import "@tekvision/a11y-settings/style.css";
```

## Use In Plain HTML

```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script type="module" src="./node_modules/@tekvision/a11y-settings/ada_overlay.js"></script>
<link rel="stylesheet" href="./node_modules/@tekvision/a11y-settings/ada_overlay.css" />
```

## Publish To npm

1. Update the package name, repository URL, and version in `package.json`.
2. Sign in to npm:

```bash
npm login
```

3. Verify publish contents:

```bash
npm run pack:check
```

4. Publish:

```bash
npm run publish:public
```

## Local Verification

From this folder:

```bash
npm install
npm run pack:check
```
