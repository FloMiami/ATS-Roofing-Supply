# ATS Roofing Supply

A responsive roofing supply company website built with React, Vite, React Router, and Bootstrap. The public quote form submits requests through Supabase, and the protected admin area uses Supabase Auth and database-enforced RLS.

## Routes

- `/` - Home
- `/products` - Roofing products
- `/about` - Company and team information
- `/quote` - Contact and quote inquiry form
- `/admin/login` - Admin sign-in
- `/admin` - Protected quote dashboard
- `/admin/quotes/:id` - Protected quote details

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`, or serve it locally with `npm run preview`.

## GitHub Pages deployment

The `Deploy to GitHub Pages` workflow deploys pushes to `main` and can also be run with `workflow_dispatch`. It builds with the repository base path `/ATS-Roofing-Supply/`; local development defaults to `/`.

In the repository, add these browser-safe values under **Settings → Secrets and variables → Actions → Variables**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (the Supabase publishable/anon-equivalent key only)

These values are embedded in the built browser assets and are not privileged credentials. Never add a Supabase service-role or secret key to these variables. The workflow creates a `404.html` SPA fallback so clean React Router paths can render on direct navigation and refresh. GitHub Pages may still report an HTTP 404 status for those fallback requests.

To enable deployment, select **GitHub Actions** as the Pages build and deployment source in **Settings → Pages**. Then merge or push the deployment workflow to `main`; no deployment is triggered from this feature branch by default.

## Technologies

- React and Vite
- React Router
- Bootstrap 5 installed through npm
- Custom CSS and the existing image assets
