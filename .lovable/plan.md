

## Dockerfile Gaps: Current vs. Reference

Comparing our Dockerfile against the proven OpenShift reference, there are several important gaps:

### 1. OpenShift Directory Structure & Permissions (Critical)
Our current Dockerfile uses `/app` as `WORKDIR` and runs as root. OpenShift assigns arbitrary UIDs at runtime, so we need:
- Use `/opt/app-root/src` as `WORKDIR` (OpenShift convention)
- Create `/opt/app-root/home/.npm` for npm cache
- Set `chown`/`chmod` with group `0` and `g=u` for arbitrary UID support
- Switch to a non-root `USER`

### 2. Missing Healthcheck
Add a `HEALTHCHECK` instruction with `curl` so OpenShift liveness/readiness probes work out of the box.

### 3. Missing Environment Variables
Add `NODE_ENV=production`, `NPM_CONFIG_CACHE`, `HOME`, and `NODE_OPTIONS` (memory limit) in the runtime stage.

### 4. npm Cache Control
Add `--no-cache` to `npm ci` calls to reduce image size.

### 5. OpenShift Labels
Add `io.openshift.*` and `io.k8s.*` labels for proper OpenShift catalog integration.

### 6. CMD Style
Switch from `npx vite preview` to `npm run preview -- --host --port 8080` (uses the existing `preview` script, avoids `npx` overhead).

### 7. Install curl
Needed for the `HEALTHCHECK` instruction.

---

### Updated Dockerfile (planned)

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /opt/app-root/src

ARG VITE_SUPABASE_PROJECT_ID
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_URL

ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL

COPY package*.json ./
RUN npm ci --no-cache
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine AS production

RUN mkdir -p /opt/app-root/src \
    /opt/app-root/home \
    /opt/app-root/home/.npm \
    /tmp && \
    chmod -R 775 /opt/app-root && \
    chmod -R 775 /opt/app-root/home/.npm && \
    chmod -R 775 /tmp

WORKDIR /opt/app-root/src

ENV HOME=/opt/app-root/home \
    NODE_ENV=production \
    PORT=8080 \
    NPM_CONFIG_CACHE=/opt/app-root/home/.npm \
    NODE_OPTIONS="--max-old-space-size=384"

COPY package*.json ./
RUN npm ci --omit=dev --no-cache

COPY --from=builder /opt/app-root/src/dist ./dist
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./

# Install vite for preview (not in prod deps)
RUN npm install --no-save vite @vitejs/plugin-react-swc

RUN apk --no-cache add curl

# OpenShift arbitrary UID support
RUN chown -R 1001:0 /opt/app-root && \
    chmod -R g=u /opt/app-root && \
    chown -R 1001:0 /tmp && \
    chmod -R g=u /tmp

USER 1001

LABEL io.openshift.expose-services="8080:http" \
      io.k8s.description="Sparklight QR Code Manager" \
      io.openshift.tags="nodejs,vite,react" \
      io.openshift.non-scalable="false" \
      io.k8s.display-name="sparklight-qr"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

CMD ["npm", "run", "preview", "--", "--host", "--port", "8080"]
```

### Other File Changes
- **`.dockerignore`** — no changes needed
- **`vite.config.ts`** — already has `preview` block, no changes needed
- **`README.md`** — update Docker section to reflect new Dockerfile conventions

### Note on UID
The reference uses `1002290000` (project-specific). We'll use `1001` as a generic non-root UID; OpenShift will override it with its assigned UID at runtime regardless. The key is the group `0` ownership and `g=u` permissions.

