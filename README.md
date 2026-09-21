# ছোট্ট.লিংক

A minimal, Bengali-first URL shortener that runs entirely on GitHub Pages.

## How it works

The destination URL is encoded into the hash portion of the generated link. That means the app needs no database, server, account, or tracking. Opening a generated link decodes the destination in the browser and redirects immediately.

## Development

```bash
npm install
npm run dev
```

## Deployment

Every push to `main` runs `.github/workflows/deploy-pages.yml`, builds the Vite site, and publishes it through GitHub Pages. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
