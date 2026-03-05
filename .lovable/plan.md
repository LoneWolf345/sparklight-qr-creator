

## Fix: Docker Build Failing Due to Lock File Mismatch

### Problem
The build fails at `npm ci --no-cache` because:
1. **Lock file out of sync** — This project uses `bun.lock`/`bun.lockb`, not a proper `package-lock.json`. `npm ci` requires an exact-match `package-lock.json`.
2. **`--no-cache` is invalid for npm** — The logs show `npm warn invalid config cache=false`. This flag doesn't exist in npm; it's a Docker layer caching concept.

### Fix (Dockerfile only)

Replace both `npm ci` calls with `npm install`:

- **Build stage (line ~13):** `RUN npm ci --no-cache` → `RUN npm install`
- **Runtime stage (line ~30):** `RUN npm ci --omit=dev --no-cache` → remove this line entirely (we already install only vite + plugin later)

Also add `package-lock.json` to `.dockerignore` so any stale lock file doesn't get copied in (npm install will generate a fresh one).

### Changes

**`Dockerfile`**
- Build stage: `npm ci --no-cache` → `npm install`
- Runtime stage: `npm ci --omit=dev --no-cache` → remove (redundant since we `npm install --no-save vite @vitejs/plugin-react-swc` right after)

**`.dockerignore`**
- Add `bun.lock`, `bun.lockb` (not needed in Docker build using npm)

### Why not regenerate package-lock.json?
This project is managed by Lovable which uses bun. Generating and maintaining a parallel `package-lock.json` would constantly drift. Using `npm install` is the pragmatic solution — slightly slower than `npm ci` but reliable. The Docker layer cache handles repeat build speed.

