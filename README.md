# libri-web

User-facing PWA for the Libri book catalog — client-only React SPA built on
TanStack Router, talking to [`libri-api`](https://github.com/masiama/libri-api).

## Requirements

- Node.js 22+
- pnpm

## Getting Started

```bash
pnpm install
pnpm dev
```

## Building For Production

```bash
pnpm build
```

`build` runs a type-check (`tsc -b`) before invoking `vite build`; run
`pnpm type-check` on its own to just type-check without building.

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with
file-based routing. Routes live as files in `src/routes`.

### Adding a route

Add a new file under `src/routes` — the route tree is generated
automatically by the `tanstackRouter` Vite plugin during `dev`/`build` (or
manually via `pnpm generate-routes`).

### Adding links

```tsx
import { Link } from "@tanstack/react-router";
```

```tsx
<Link to="/about">About</Link>
```

More on the `Link` component in the
[Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Layout

The root layout lives in `src/routes/__root.tsx`. Anything rendered there
wraps every route via `<Outlet />`.

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

1. Remove the demo pages in `src/routes/demo/` (if present)
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Uninstall the packages: `pnpm remove @tailwindcss/vite tailwindcss`

## Learn More

- [TanStack Router documentation](https://tanstack.com/router)
- [Tailwind CSS documentation](https://tailwindcss.com/)
