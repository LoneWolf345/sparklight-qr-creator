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
RUN npm install
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

COPY --from=builder /opt/app-root/src/dist ./dist
COPY package.json ./
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

CMD ["node", "node_modules/vite/bin/vite.js", "preview", "--host", "--port", "8080"]
