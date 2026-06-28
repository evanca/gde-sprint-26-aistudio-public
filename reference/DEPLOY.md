# Static Deployment Guide — Sora Stationery (Papershop)

Sora Stationery is a fully static web application. It does not require Node.js, databases, or dynamic server environments for production. This design offers lightning-fast loading speeds, high reliability, and security.

## Recommended Static Hosting Providers

You can host this static app on any modern hosting provider for free. Below are standard guidelines:

### 1. GitHub Pages
1. Push this repository to your GitHub account.
2. Go to **Settings** > **Pages**.
3. Choose the branch (e.g. `main`) and root folder `/` as the build source, then hit Save.
4. Your website will be live at `https://<username>.github.io/sora-stationery/`.

### 2. Vercel
1. Import your project repository from GitHub.
2. Vercel will automatically detect the static project. No build commands are needed.
3. Deploy and receive an instant production URL with automatic SSL and CDN distribution.

### 3. Netlify
1. Connect Netlify to your repository.
2. Select root (`./`) as the publish directory and leave the build command blank.
3. Click deploy to launch the app.

---

## Zero-Secrets Safety Guarantee

This application is completely static and loads all assets client-side.
- Ensure that no dynamic files (such as `.env`, `.env.local`, or configuration keys) are committed to Git.
- **`GEMINI_API_KEY` is not required or shipped** as this application is a pure front-end client, keeping client keys perfectly isolated from external systems.
