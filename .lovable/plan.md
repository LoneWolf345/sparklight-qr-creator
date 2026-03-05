

## Fix: Missing `package.json` in Runtime Container

The runtime stage never copies `package.json` into the container. When the container starts and runs `npm run preview`, npm can't find the script definition.

### Root Cause

In the Dockerfile runtime stage, we copy `dist/`, `vite.config.ts`, and tsconfig files from the builder, but `package.json` is not copied. The `CMD ["npm", "run", "preview", ...]` command requires `package.json` to resolve the `preview` script.

### Fix

Add `COPY package.json ./` in the runtime stage, before the `npm install --no-save` line:

```dockerfile
# In runtime stage, after WORKDIR and ENV setup:
COPY package.json ./
RUN npm install --no-save vite @vitejs/plugin-react-swc
```

This is a one-line addition to the Dockerfile.

