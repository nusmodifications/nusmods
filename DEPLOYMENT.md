# Deployment Guide

This document describes the current NUSMods deployment model.

## Overview

NUSMods is deployed as two parts:

1. Website + export endpoints on Vercel.
2. Self-managed data pipeline (scraper + static API data hosting, plus search infra).

## Website and Export (Vercel)

The website (`nusmods.com`) and export service are deployed via Vercel.

- Website config: `website/vercel.json`
- Export config: `export/vercel.json`

Operational flow:

1. Push a branch / open a PR to get a preview deployment.
2. Merge to the production branch configured in Vercel.
3. Validate critical flows after deploy:
   - module search
   - timetable rendering
   - timetable export (PNG/PDF)
   - error reporting

For local production-like verification:

```sh
cd website
pnpm build
npx serve -s dist
```

## Self-Managed Data/API Infrastructure

Use this section if you operate scraper/data infrastructure outside Vercel.

### Recommended baseline

- Ubuntu LTS
- Node 22 LTS
- pnpm
- PM2
- Nginx (for static API data serving)

### Server bootstrap (Ubuntu)

```sh
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx curl build-essential
```

Install Node 22 LTS and pnpm using your standard team method (nvm, fnm, or distro policy), then verify:

```sh
node -v
pnpm -v
```

Install PM2 globally:

```sh
pnpm add -g pm2
pm2 -v
```

### Repository setup

```sh
git clone https://github.com/nusmodifications/nusmods.git
cd nusmods
pnpm install
```

### Scraper setup and runtime

In `scrapers/nus-v2`:

```sh
cd scrapers/nus-v2
cp env.example.json env.json
# fill in env.json with required internal API credentials / endpoints
pnpm dev test | pnpm bunyan
pnpm build
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd
```

Notes:

- Scraper production scripts are defined in `scrapers/nus-v2/package.json`.
- PM2 config is in `scrapers/nus-v2/ecosystem.config.js`.
- ElasticSearch config is optional for local development, but required for production search.

### Static API data serving (Nginx)

The API static JSON data directory is typically served as `api.nusmods.com`.

1. Place generated data under your chosen path (for example, `/home/<user>/api.nusmods.com`).
2. Configure an Nginx server block to serve that directory.
3. Enable and restart Nginx:

```sh
sudo systemctl enable nginx
sudo systemctl restart nginx
```

4. Validate permissions for all parent directories and files.
5. Point DNS to this host and verify public access.

### Updating production data pipeline

```sh
cd /path/to/nusmods
git pull
pnpm install
cd scrapers/nus-v2
pnpm build
pm2 restart ecosystem.config.js
```

Run a scraper health check after restart:

```sh
pnpm dev test | pnpm bunyan
```
