# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /app

# Build-time env vars (Vite inlines these during build)
ARG VITE_SUPABASE_PROJECT_ID
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_URL

ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime (vite preview)
FROM node:22-alpine AS runtime

WORKDIR /app

# Copy built output and config needed by vite preview
COPY --from=build /app/dist ./dist
COPY --from=build /app/vite.config.ts ./
COPY --from=build /app/package.json ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/tsconfig.node.json ./

# Install only what vite preview needs
RUN npm install --no-save vite @vitejs/plugin-react-swc

EXPOSE 8080

CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "8080"]
