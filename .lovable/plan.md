

# Phase 1: Foundation — Design System, Auth, Database, Login, Routing

## Overview
Set up the Sparklight QR Batch Generator foundation: branding, database schema, authentication with role-based access, and core page routing.

## Brand Identity
- Copy the uploaded Sparklight logo to `src/assets/sparklight-logo.png`
- Sparklight brand colors derived from logo: purple accent (`#7B2D8E`), dark gray text (`#54585A`), white backgrounds
- Update CSS variables to reflect Sparklight branding

## Database Schema (Lovable Cloud / Supabase)

**Tables:**
- `profiles` — id (FK auth.users), username, display_name, is_active, created_at
- `user_roles` — id, user_id (FK auth.users), role (enum: admin, associate), unique(user_id, role)
- `app_settings` — single-row config: base_url, default_destination_url, primary_color, secondary_color, qr_error_correction, qr_size, quiet_zone, logo_url, x_offset_mm, y_offset_mm
- `qr_batches` — batch_id, name, template, created_by, created_at, row_count, destination_url_override, status
- `qr_codes` — qr_id, batch_id, homes_passed_id, address, status, created_at

**RLS:** `has_role()` security definer function for admin checks. Profiles readable by owner. Batches/codes readable by all authenticated, writable by owner or admin.

**Note:** QR URL is `{BASE_URL}/HH/{HomesPassedID}` — no random token needed, HomesPassedID comes from CSV import.

## Authentication
- Supabase email/password auth
- Auto-create profile on signup via trigger
- Auth context provider wrapping the app
- Protected route wrapper checking auth state and role

## Pages & Routing
| Route | Component | Access |
|---|---|---|
| `/login` | Login page | Public |
| `/` | Dashboard / redirect to `/batches` | Authenticated |
| `/batches` | Batch list | Authenticated |
| `/batches/new` | Create batch wizard | Authenticated |
| `/batches/:id` | Batch detail | Authenticated |
| `/admin` | Admin settings | Admin only |
| `*` | 404 | Public |

## UI Components (Phase 1)
- `AppLayout` — sidebar nav with Sparklight logo, nav links, user menu with logout
- `LoginPage` — branded login form (email + password)
- `DashboardPage` — placeholder landing with stats cards
- `ProtectedRoute` — auth guard component
- `AdminRoute` — role guard component

## File Structure
```
src/
  assets/sparklight-logo.png
  components/
    layout/AppLayout.tsx, Sidebar.tsx, ProtectedRoute.tsx
    auth/LoginPage.tsx
  contexts/AuthContext.tsx
  hooks/useAuth.ts, useRole.ts
  pages/
    Login.tsx, Dashboard.tsx, Batches.tsx, BatchNew.tsx,
    BatchDetail.tsx, Admin.tsx, NotFound.tsx
  lib/supabase.ts
```

## Implementation Order
1. Copy logo asset, update CSS variables for Sparklight branding
2. Set up Supabase client + database tables + RLS + triggers
3. Build AuthContext, login page, protected route wrappers
4. Build AppLayout with sidebar navigation
5. Create placeholder pages for all routes
6. Wire up routing in App.tsx

