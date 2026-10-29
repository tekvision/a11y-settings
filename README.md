# a11y-settings

`a11y-settings` is an accessibility overlay widget that adds user-controlled accessibility adjustments to any web page.

## What's New in v1.0.1

### Improvements
- Fixed memory leaks in the focus visibility, slider, and font enhancer watchers.
- Reduced duplicate page listeners and watchers for better stability.
- Fixed font and alignment issues for newly added DOM elements.
- Improved cleanup so removed elements are released properly.

## Features

- Color contrast presets
- Font style adjustments
- Font size controls
- Focus visibility toggle
- Link and button highlighting
- Text alignment controls

Inline SVG markup is maintained in `components/icons/overlay-icons.js` and
inserted by `components/overlay_ui.js`. Icons retain their colors, sizes, and
`ada-ignore-contrast` class without requiring separate image requests.

Image assets use static `new URL('../images/example.svg', import.meta.url)`
references. Vite and Webpack can resolve and include these assets in React
builds, while plain HTML module usage still works without a bundler. No copying
of images into the consuming application's public folder is required.

## Install

```bash
npm install @sma11y/site-settings
```

`jquery` is installed automatically as a dependency.

## Use In A Browser Bundler App (Vite, Webpack)

Call `initOverlay()` after the document body is available. Importing the package
does not automatically mount the widget. Repeated calls do not add duplicate widgets.

```js
import { initOverlay } from "@sma11y/site-settings";

initOverlay();
```

The package entry imports both:

- `ada_overlay.js`
- `ada_overlay.css`

If you only need the style file explicitly:

```js
import "@sma11y/site-settings/style.css";
```

## Use In Plain HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Overlay Test</title>

  <link rel="stylesheet" href="./ada_overlay.css">
</head>
<body>
  <h1>My Test Website</h1>
  <p>Testing my accessibility overlay npm package.</p>

  <script type="importmap">
  {
    "imports": {
      "jquery": "https://esm.sh/jquery@3.7.1"
    }
  }
  </script>
  <script type="module">
    import { initOverlay } from "./ada_overlay.js";
    initOverlay();
  </script>
</body>
</html>
```

Serve the page over HTTP, not `file://`.

## Use In Next.js

```jsx
"use client";

import { useEffect } from "react";

export default function AccessibilityOverlay() {
  useEffect(() => {
    let mounted = true;
    import("@sma11y/site-settings").then(({ initOverlay }) => {
      if (mounted) initOverlay();
    }).catch((error) => {
      console.error("Failed to initialize accessibility overlay:", error);
    });
    return () => { mounted = false; };
  }, []);

  return null;
}
```

Render this component in your layout. The widget remains mounted for the page's
lifetime; there is currently no teardown API.

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
