

## Updated Plan: Docker Deployment with Vite Preview

Instead of Nginx, the container will use `vite preview` to serve the production build. This simplifies the setup to a single runtime (Node) and eliminates the Nginx config file entirely.

### Files to Create/Modify

**1. `Dockerfile`** -- Single-runtime multi-stage build
- Stage 1 (`node:22-alpine`): `npm ci`, `npm run build`
- Stage 2 (`node:22-alpine`): Copy `dist/`, `package.json`, `vite.config.ts`, install only production Vite deps (`npm install vite @vitejs/plugin-react-swc`), run `npx vite preview --host 0.0.0.0 --port 8080`
- Use `ARG` / `ENV` for each `VITE_*` variable so Vite inlines them at build time
- Expose port 8080

**2. `vite.config.ts`** -- Add `preview` block
```ts
preview: {
  host: "::",
  port: 8080,
}
```
This ensures `vite preview` listens on 8080 and binds to all interfaces inside the container.

**3. `.dockerignore`**
- `node_modules`, `.git`, `dist`, `.env`, `supabase/.temp`, etc.

**4. `.env.example`** -- Document build-time env vars
- `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`

**5. `README.md`** -- Append Docker section
- `docker build` with `--build-arg` examples
- `docker run -p 8080:8080` command
- Mermaid sequence diagram: Developer -> Build -> Registry -> OpenShift

### What is removed vs. previous plan
- No `nginx.conf` file
- No Nginx runtime stage
- Runtime stage stays on Node Alpine instead of switching to Nginx Alpine

### SPA Routing Note
`vite preview` serves the built `dist/` folder and inherently handles SPA fallback for client-side routing -- no extra config needed.

