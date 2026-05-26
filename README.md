# Sarayli Döner Website

Official website for **Sarayli**, a Turkish restaurant.

- Live site: https://sarayli-doener.de
- Purpose: present the restaurant online and support customer-facing website flows.

## Tech stack

- Svelte: **70.4%**
- TypeScript: **28.6%**

## Setup

### Prerequisites

- Node.js 20.19.0 or newer
- npm

### Install dependencies

```sh
npm ci
```

## Development

Start the local development server:

```sh
npm run dev
```

Or open it directly in a browser:

```sh
npm run dev -- --open
```

## Building

Create a production build:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## Deployment

This project is configured as a SvelteKit app (Node adapter) and can be deployed as a Node.js service.

Typical deployment flow:

1. Install dependencies: `npm ci`
2. Build: `npm run build`
3. Start with your process/runtime setup using the built output

A Dockerfile and docker-compose files are also included for container-based deployment.
