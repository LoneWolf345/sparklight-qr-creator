

## Restructure Access: Three Permission Tiers

The app will support three access levels without requiring login by default:

### Permission Matrix

```text
Feature                  | Unauthenticated | Associate | Admin
─────────────────────────┼─────────────────┼───────────┼──────
Single QR (view/gen)     |       ✓         |     ✓     |   ✓
View communities         |       ✓         |     ✓     |   ✓
Reprint from communities |       ✓         |     ✓     |   ✓
Create new community     |       ✗         |     ✓     |   ✓
Delete community         |       ✗         |     ✗     |   ✓
Admin settings           |       ✗         |     ✗     |   ✓
```

### Changes

**1. Routing (App.tsx, ProtectedRoute.tsx)**
- Remove `ProtectedRoute` wrapper from `/batches`, `/batches/:id`, and `/single-qr` — these become public routes.
- Keep `ProtectedRoute` on `/batches/new` (associates and admins only).
- Keep `AdminRoute` on `/admin`.
- Add an `AssociateOrAdminRoute` that requires login but allows both roles.

**2. Sidebar (AppSidebar.tsx)**
- Show "Single QR", "Communities" nav items to everyone.
- Show "New Community" only when logged in (associate or admin).
- Show "Admin Settings" only for admin role.
- Show "Sign Out" only when logged in; show "Sign In" link when not logged in.

**3. Communities list page (Batches.tsx)**
- Hide "New Community" button when not logged in.
- Keep delete button admin-only (already done).

**4. Community detail page (BatchDetail.tsx)**
- Reprint stays available to everyone.
- Delete button stays admin-only (already done).

**5. AuthContext (AuthContext.tsx)**
- Make `useAuth` gracefully handle unauthenticated state (it already does — `user` is null).

**6. Database RLS policies**
- Update `qr_batches` SELECT policy to allow anonymous access (currently requires authenticated).
- Update `qr_codes` SELECT policy to allow anonymous access.
- `app_settings` SELECT already uses `true` but requires authenticated role — update to allow anon.
- All write policies remain unchanged (require auth).

**7. AppLayout**
- Works as-is since sidebar handles auth state display.

