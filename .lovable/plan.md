## Add Sign-In Prompts for Unauthenticated Users

Add subtle, professional messaging in two locations to inform unauthenticated visitors that creating communities requires an account.

### Changes

**1. Communities list page (`src/pages/Batches.tsx`)**

- When the user is not logged in, add a small info banner below the page header using the existing `Alert` component. Message: "To create new communities or manage QR batches, sign in." with a "Sign In" link.
- In the empty-state (no communities yet), adjust the message to include the same guidance instead of the current blank prompt.

**2. Single QR page (`src/pages/SingleQr.tsx`)** — no change needed since single QR generation is available to everyone.

**3. Sidebar (`src/components/layout/AppSidebar.tsx`)** — already shows "Sign In" for unauthenticated users; no change needed.

### Implementation Details

- Use the existing `Alert` / `AlertDescription` component with `variant="default"` for a clean, non-intrusive look.
- Import `LogIn` icon from lucide-react to pair with the sign-in link.
- Only render the banner when `user` is `null` (from `useAuth`).
- The banner includes a `Link` to `/login` styled as an inline text link.