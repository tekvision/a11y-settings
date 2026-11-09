# Changelog

## v1.0.2

### Improvements
- Added a System Default font option and improved font restoration.
- Improved disabled button visibility in colour contrast modes.
- Moved Tekvision branding to a compact footer.
- Added highlighting for dynamically added links and buttons.
- Added support for custom overlay triggers.

To use a custom button, give it the ID `overlay-icon` and pass its DOM element
to `initOverlay()` after the button is in the document:

```html
<button id="overlay-icon" type="button" aria-label="Open accessibility settings">
	Accessibility settings
</button>
```

```js
import { initOverlay } from "@sma11y/site-settings";

const trigger = document.getElementById("overlay-icon");
initOverlay({ trigger });
```

## v1.0.1

### Memory leak fixes

**focus_visibility.js**
- `tabindex` changes are ignored when focus visibility is off.
- The page watcher starts only when focus visibility is turned on and stops when it's turned off. It now watches only `tabindex` instead of every attribute.
- Each element gets exactly one `focus` and one `blur` listener. Before, a new pair was added on every `tabindex` or contrast change. Later calls now only update the outline colour.
- Saved styles are kept in a `WeakMap` instead of a `Set` and an array, so removed elements are freed.

**slider.js**
- The page watcher starts when a font size is applied and stops on revert.
- `attributes: true` is removed, because the callback only handles added nodes.
- Saved styles are kept in a `WeakMap`, and revert looks them up directly instead of searching a list.

**font_enhancer.js**
- Font style and text alignment used to start two identical page watchers. They now share one, which runs only while either setting is on.
- `attributes: true` is removed.
- Saved font and alignment values are kept in `WeakMap`s, with direct lookups on revert.

### Bug fixes (font_enhancer.js)
- **New elements didn't get the font.** `handleUpdatedNodes()` used `fontStyleList`, which isn't defined there, so it threw an error. It now looks the option up by id and skips it if it isn't found.
- **New elements didn't get both settings.** With font style and alignment both on, new elements only got the font. They now get both.

### Version
- `package.json`: `1.0.0` → `1.0.1`
