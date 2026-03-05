

## Plan: Hide QR Border Plugin Trial Watermark Globally

### What
Add a global CSS rule to `src/index.css` to hide the `qr-border-plugin-trial` watermark element everywhere in the app.

### File to modify

**`src/index.css`** — Add at the end, after the `@layer base` block:

```css
.qr-border-plugin-trial {
  display: none !important;
}
```

This catches the watermark regardless of where the plugin injects it in the DOM (sidebar, preview, or elsewhere). The existing scoped selector on the preview div in `SingleQr.tsx` can remain as a fallback.

