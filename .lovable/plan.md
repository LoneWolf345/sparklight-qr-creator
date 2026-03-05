

# Fix QR Preview Overflow

The 360px QR preview SVG is overflowing its container on smaller screens or when the sidebar is open.

## Solution
Add responsive sizing constraints to the preview container div in `QrStyleTab.tsx`:
- Add `max-w-full` to the preview div so the SVG scales down on narrow viewports
- Add `w-full max-w-[360px]` and set the SVG to scale via CSS (`[&>svg]:w-full [&>svg]:h-auto`) so it remains proportional

## File Change
| File | Change |
|---|---|
| `src/components/admin/QrStyleTab.tsx` (line ~524) | Add responsive classes to the preview `div`: `w-full max-w-[360px] [&>svg]:w-full [&>svg]:h-auto` |

