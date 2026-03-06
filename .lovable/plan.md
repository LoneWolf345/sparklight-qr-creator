

## Fix: Vite binary not found in runtime container

The `.bin` symlink isn't being created by `npm install --no-save`. Instead of relying on the bin symlink, invoke the Vite CLI directly via Node:

**Dockerfile line 67** — change CMD to:
```dockerfile
CMD ["node", "node_modules/vite/bin/vite.js", "preview", "--host", "--port", "8080"]
```

This bypasses the `.bin` symlink entirely and runs the Vite entry point directly, which is guaranteed to exist after `npm install`.

