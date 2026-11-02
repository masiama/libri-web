# Libri Web

User-facing app for the Libri book catalog. Browse books, search, and scan
barcodes with your camera.

Built with React, Vite, TypeScript, TanStack Router, Tailwind CSS, and Clerk
authentication.

## Features

- Browse and search the library
- Book pages with cover, ISBN, barcode, and sharing
- Barcode scanner with a list of books scanned in the session
- Sign in, sign up, and password reset
- Light and dark theme
- Works on phones, tablets, and desktops

## Requirements

- Node.js 22+
- pnpm
- A running [`libri-api`](https://github.com/masiama/libri-api) instance
- A Clerk application with a publishable key

## Environment variables

Create a local env file from the example:

```bash
cp .env.example .env
```

Available variables:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_***
VITE_API_BASE=http://localhost:8080
```

`VITE_API_BASE` should point to the host running
[`libri-api`](https://github.com/masiama/libri-api).

## Getting started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

The app runs on [http://localhost:3001](http://localhost:3001).

## Authentication

`libri-web` signs users in with Clerk and sends a Bearer token to
[`libri-api`](https://github.com/masiama/libri-api). Signed-out visitors are
sent to the sign-in page.
