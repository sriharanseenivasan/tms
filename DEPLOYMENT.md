# Truck Tracking (TMS) Mock UI — Deployment Guide

Deploy this Vite + React (SPA, mock data only) app to the same AWS Lightsail
Ubuntu box that already hosts your other apps, served by nginx from `/opt`
under the subpath **`/tms`** on `nexus-digit.com`.

- **Repo target:** `https://github.com/sriharanseenivasan/tms.git`
- **App location in repo:** `truck-tracking-ui/` (the repo root also holds `TRUCK_TRACKING_SPEC.md`)
- **Server source path:** `/opt/tms`
- **Built static files:** `/opt/tms/truck-tracking-ui/dist`
- **Public URL:** `https://nexus-digit.com/tms/`
- **Web server:** nginx (same server block that already serves `/atlas-erp-suite/`, `/atlas-crm/`, etc.)

> This is a **mock UI** — there is no backend/API to run. nginx only serves the
> static build. All data comes from the in-app mock services.

---

## 1. Prepare the app for the `/tms` subpath

Because this SPA is served from a sub-folder (not the domain root), the build
must know its base path and React Router must know its `basename`. Do these two
changes **once** and commit them.

### 1.1 Set the Vite base path

Edit [truck-tracking-ui/vite.config.ts](truck-tracking-ui/vite.config.ts) and add
the `base` option:

```ts
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/tms/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
```

### 1.2 Set the Router basename

This app uses `createBrowserRouter`. Edit
[truck-tracking-ui/src/app/router.tsx](truck-tracking-ui/src/app/router.tsx) and
pass a `basename` as the second argument to `createBrowserRouter`:

```ts
export const router = createBrowserRouter(
  [
    // ...existing route tree stays exactly the same...
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') },
)
```

> `import.meta.env.BASE_URL` becomes `/tms/` from the Vite `base` above; the
> `.replace(/\/$/, '')` trims the trailing slash so React Router gets `/tms`.
> In local dev (`npm run dev`) `BASE_URL` is `/`, so routing still works at root.

### 1.3 Verify the build locally (Windows / PowerShell)

```powershell
cd truck-tracking-ui
npm install
npm run build
npm run preview
```

Open the previewed URL and confirm the app loads and deep links work under `/tms/`.

---

## 2. Push the code to GitHub

Run these from the **repo root** (`tms`).

### 2.1 Add a `.gitignore` (if missing)

Create `tms/.gitignore` so build output and dependencies are not committed:

```gitignore
node_modules/
dist/
.env
.env.local
*.log
```

### 2.2 First-time setup

```powershell
git init
git add .
git commit -m "TMS mock UI: initial commit + /tms base path"
git branch -M main
git remote add origin https://github.com/sriharanseenivasan/tms.git
git push -u origin main
```

### 2.3 Subsequent updates

```powershell
git add .
git commit -m "Describe your change"
git push
```

---

## 3. Deploy on the Lightsail server

SSH into the box:

```bash
ssh ubuntu@<your-lightsail-ip>
```

### 3.1 Clone the repo into `/opt`

```bash
sudo mkdir -p /opt
cd /opt
sudo git clone https://github.com/sriharanseenivasan/tms.git tms
sudo chown -R ubuntu:ubuntu /opt/tms
```

### 3.2 Build on the server

Ensure Node.js (20+ recommended) is installed:

```bash
node -v || (curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs)
```

Build the static bundle from the **app subfolder**:

```bash
cd /opt/tms/truck-tracking-ui
npm install
npm run build
```

This produces the static files in `/opt/tms/truck-tracking-ui/dist`.

> This repo does not commit a `package-lock.json`, so use `npm install` (not
> `npm ci`). If you later commit the lockfile, you can switch to `npm ci` for
> faster, reproducible installs.
>
> **Redeploy later:**
> `cd /opt/tms && git pull && cd truck-tracking-ui && npm install && npm run build`

---

## 4. Configure nginx

Your existing server block already serves `nexus-digit.com` over HTTPS with
locations like `/atlas-erp-suite/` and `/atlas-crm/`. Add a matching `/tms/`
location.

> If a `/tms/` location already exists in your config, just repoint its `alias`
> to `/opt/tms/truck-tracking-ui/dist/` and skip creating a new one.

### 4.1 Back up the current config

```bash
cd /etc/nginx/sites-available
# use whatever your existing site file is named, e.g. atlas-erp-suite
sudo cp atlas-erp-suite atlas-erp-suite.bak.$(date +%s)
```

### 4.2 Add (or update) the location block

```bash
sudo nano /etc/nginx/sites-available/atlas-erp-suite
```

Inside the `server { listen 443 ssl; ... }` block, alongside your other app
locations, add:

```nginx
    location = /tms {
        return 301 /tms/;
    }

    location ^~ /tms/ {
        alias /opt/tms/truck-tracking-ui/dist/;
        try_files $uri $uri/ /tms/index.html;
    }

    location = /tms/index.html {
        alias /opt/tms/truck-tracking-ui/dist/index.html;
        add_header Cache-Control "no-store";
    }
```

> Place this **before** the catch-all `location / { ... }`. The `^~` modifier
> ensures the SPA prefix wins over any generic static-asset regex block.
>
> To password-protect it, add these two lines inside the `location ^~ /tms/`
> block and create the htpasswd file:
>
> ```nginx
>         auth_basic "Restricted Access";
>         auth_basic_user_file /etc/nginx/.htpasswd-tms;
> ```
>
> ```bash
> sudo apt-get install -y apache2-utils
> sudo htpasswd -c /etc/nginx/.htpasswd-tms <username>
> ```

### 4.3 Test and reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Verify

Open:

```
https://nexus-digit.com/tms/
```

- The dashboard should load (index redirects to the dashboard route).
- Reloading a deep route (e.g. `/tms/reports`) should work — handled by the
  `try_files ... /tms/index.html` fallback.
- Static assets (JS/CSS) load from `/tms/assets/...` thanks to the Vite `base`
  setting.

---

## 6. Redeploy checklist (quick reference)

```bash
cd /opt/tms
git pull
cd truck-tracking-ui
npm install
npm run build
sudo nginx -t && sudo systemctl reload nginx
```

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Blank page, 404s on JS/CSS in console | `base` not set to `/tms/` | Set `base: '/tms/'` in `vite.config.ts`, rebuild |
| Links/routes go to domain root | Router `basename` missing | Pass `{ basename: import.meta.env.BASE_URL.replace(/\/$/, '') }` to `createBrowserRouter` |
| Deep-link refresh returns 404 | Missing SPA fallback | Confirm `try_files ... /tms/index.html` in nginx |
| `403 Forbidden` | nginx can't read the dist folder | `sudo chown -R ubuntu:ubuntu /opt/tms` and ensure `truck-tracking-ui/dist/` exists |
| `npm install` slow or version drift | No committed `package-lock.json` | Optional: run `npm install` locally, commit the generated `package-lock.json`, then use `npm ci` on the server |
| Old assets served | Browser/nginx cache | Hard refresh; `index.html` is already sent with `no-store` |
```