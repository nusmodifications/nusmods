# Migrate NUSMods Styling to Tailwind CSS v4 + shadcn/ui

## Context

NUSMods currently uses SCSS + CSS Modules + Bootstrap 4.6.2 for styling. This migration establishes Tailwind CSS v4 + shadcn/ui as the new styling foundation. We adopt shadcn's default design system (spacing, radius, shadows, etc.) and only customize the color palette to match NUSMods brand colors. The UI will look like standard shadcn — not a pixel-perfect replica of the current Bootstrap-based UI. Scope: foundation setup, shared components, and a few demo migrations.

---

## Step 1: Install Dependencies

**File:** `website/package.json`

```bash
cd website
yarn add tailwindcss @tailwindcss/postcss lucide-react class-variance-authority clsx tailwind-merge
```

- `tailwindcss` + `@tailwindcss/postcss` — Tailwind v4 core + PostCSS plugin for webpack
- `lucide-react` — Icon library (successor to react-feather)
- `class-variance-authority` — Component variants (shadcn dependency)
- `clsx` + `tailwind-merge` — Class merging (shadcn's `cn()` helper)

Do NOT remove existing packages yet (bootstrap, classnames, react-feather, sass, etc.).

---

## Step 2: Webpack Configuration — Split CSS and SCSS Pipelines

Tailwind v4 is its own CSS preprocessor and cannot share a pipeline with sass-loader. We add separate rules: `.css` → Tailwind PostCSS, `.scss` → existing pipeline (unchanged).

### 2a. Create Tailwind PostCSS config

**New file:** `website/postcss.tailwind.js`

```js
module.exports = {
  plugins: [require('@tailwindcss/postcss')],
};
```

### 2b. Modify `website/webpack/webpack.parts.js`

1. Change the test regex in both `loadCSS` and `productionCSS` rules from `/\.(css|scss)$/` to `/\.scss$/`

2. Add two new exported functions for `.css` files using the Tailwind PostCSS config:

```js
exports.loadTailwindCSS = () => ({
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        'style-loader',
        { loader: 'css-loader', options: { importLoaders: 1 } },
        { loader: 'postcss-loader', options: {
          postcssOptions: require(path.join(ROOT, 'postcss.tailwind.js')),
        }},
      ],
    }],
  },
});

exports.productionTailwindCSS = () => ({
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        { loader: 'css-loader', options: { importLoaders: 1 } },
        { loader: 'postcss-loader', options: {
          postcssOptions: require(path.join(ROOT, 'postcss.tailwind.js')),
        }},
      ],
    }],
  },
});
```

### 2c. Add Tailwind rules to webpack configs

- `webpack/webpack.config.dev.js` — add `parts.loadTailwindCSS()` to merge array before existing `loadCSS` calls
- `webpack/webpack.config.prod.js` — add `parts.productionTailwindCSS()` before `parts.productionCSS()`
- `webpack/webpack.config.timetable-only.js` — add `parts.productionTailwindCSS()` before `parts.productionCSS()`

---

## Step 3: Create Tailwind CSS Entry File

**New file:** `website/src/styles/tailwind/globals.css`

Use shadcn's default design system. The only customization is mapping NUSMods colors into shadcn's CSS variable slots. Everything else (spacing, radius, shadows, typography) uses shadcn/Tailwind defaults.

```css
@import "tailwindcss";
@source "../../views/**/*.tsx";
@source "../../views/**/*.ts";
@source "../../lib/**/*.ts";

@custom-variant dark (&:where(.dark, .dark *));

@layer base {
  :root {
    /* shadcn color system — NUSMods palette mapped in */
    --background: 0 0% 100%;
    --foreground: 220 5% 31%;           /* #69707a gray */
    --card: 0 0% 100%;
    --card-foreground: 220 5% 31%;
    --popover: 0 0% 100%;
    --popover-foreground: 220 5% 31%;
    --primary: 8 100% 61%;              /* #ff5138 NUSMods primary */
    --primary-foreground: 0 0% 100%;
    --secondary: 220 13% 96%;           /* #f3f5f8 gray-lightest */
    --secondary-foreground: 220 5% 31%;
    --muted: 220 13% 96%;
    --muted-foreground: 222 4% 55%;     /* #848490 gray-mid */
    --accent: 220 13% 96%;
    --accent-foreground: 220 5% 31%;
    --destructive: 0 72% 42%;           /* #b71c1c danger */
    --destructive-foreground: 0 0% 100%;
    --border: 220 9% 84%;              /* #d3d6db gray-lighter */
    --input: 220 9% 84%;
    --ring: 8 100% 61%;                /* primary for focus rings */
    --radius: 0.5rem;

    /* Sidebar (shadcn default) */
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 8 100% 61%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.3% 26.1%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 8 100% 61%;
  }

  .dark {
    --background: 220 7% 13%;          /* #222324 gray-dark */
    --foreground: 0 0% 67%;            /* #aaa dark mode text */
    --card: 220 7% 13%;
    --card-foreground: 0 0% 67%;
    --popover: 220 7% 13%;
    --popover-foreground: 0 0% 67%;
    --primary: 8 100% 61%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 16%;             /* #292929 gray-lightest dark */
    --secondary-foreground: 0 0% 67%;
    --muted: 0 0% 16%;
    --muted-foreground: 0 0% 49%;      /* #7d7d7d gray-mid dark */
    --accent: 0 0% 16%;
    --accent-foreground: 0 0% 67%;
    --destructive: 0 72% 42%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 28%;               /* #474747 gray-lighter dark */
    --input: 0 0% 28%;
    --ring: 8 100% 61%;

    --sidebar-background: 220 7% 13%;
    --sidebar-foreground: 0 0% 67%;
    --sidebar-primary: 8 100% 61%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 0 0% 16%;
    --sidebar-accent-foreground: 0 0% 67%;
    --sidebar-border: 0 0% 28%;
    --sidebar-ring: 8 100% 61%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}
```

---

## Step 4: Create Timetable Theme CSS Variables

**New file:** `website/src/styles/tailwind/themes.css`

Maps all 12 themes × 8 colors to CSS custom properties so new Tailwind-based components can access them:

```css
.theme-ashes {
  --theme-color-0: #c7ae95; --theme-color-1: #c7c795;
  --theme-color-2: #aec795; --theme-color-3: #95c7ae;
  --theme-color-4: #95aec7; --theme-color-5: #ae95c7;
  --theme-color-6: #c795ae; --theme-color-7: #c79595;
}
/* ... all 12 themes ... */
```

These exist in parallel with the existing SCSS-generated `.theme-{name} .color-{N}` classes.

---

## Step 5: Import Tailwind CSS in App Entry Points

**File:** `website/src/entry/main.tsx` — add before `import 'styles/main.scss'`:
```tsx
import 'styles/tailwind/globals.css';
import 'styles/tailwind/themes.css';
```

**File:** `website/src/entry/export/main.tsx` — add before `import 'styles/main.scss'`:
```tsx
import 'styles/tailwind/globals.css';
import 'styles/tailwind/themes.css';
```

---

## Step 6: shadcn/ui Manual Setup

### 6a. Create cn() utility

**New file:** `website/src/lib/utils.ts`

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 6b. Create components.json

**New file:** `website/components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/tailwind/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "views/ui",
    "utils": "lib/utils",
    "ui": "views/ui",
    "lib": "lib",
    "hooks": "views/hooks"
  }
}
```

### 6c. Create shadcn/ui components

**New directory:** `website/src/views/ui/`

Use **standard shadcn/ui component code** copied directly from the shadcn docs — no custom modifications. The CSS variables in `globals.css` handle the NUSMods color mapping. The only adjustment needed is import paths (`lib/utils` instead of `@/lib/utils`).

| File | Component |
|------|-----------|
| `button.tsx` | `<Button variant="default\|destructive\|outline\|secondary\|ghost\|link">` |
| `card.tsx` | `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>` |
| `badge.tsx` | `<Badge variant="default\|secondary\|destructive\|outline">` |
| `input.tsx` | `<Input>` |
| `alert.tsx` | `<Alert>`, `<AlertTitle>`, `<AlertDescription>` |

---

## Step 7: Dark Mode Migration

### 7a. Add `.dark` class on `<html>`

**File:** `website/src/views/AppShell.tsx` (line ~129-137)

```tsx
<Helmet>
  <html className={classnames({ dark: isDarkMode })} />
  <body
    className={classnames(`theme-${theme}`, {
      'mode-dark': isDarkMode,        // KEEP for backward compat with SCSS
      'mdc-theme--dark': isDarkMode,
      'mobile-safari': isIOS,
    })}
  />
</Helmet>
```

Keep `mode-dark` on `<body>` — existing SCSS and `@mixin night-mode` still depend on it.

### 7b. Update export entry point

**File:** `website/src/entry/export/main.tsx` (line 35) — add after existing classList toggle:
```tsx
document.documentElement.classList.toggle('dark', data.settings.colorScheme === DARK_COLOR_SCHEME);
```

---

## Step 8: Demo Component Migrations

Migrate 3 small components to demonstrate the pattern. Use standard shadcn/Tailwind styling (not replicating the old look).

### 8a. `Warning` — `src/views/errors/Warning.tsx`

Delete `Warning.scss`. Replace `react-feather` AlertTriangle with `lucide-react` TriangleAlert (renamed in lucide). Use Tailwind utility classes for sizing/color.

### 8b. `CloseButton` — `src/views/components/CloseButton.tsx`

Delete `CloseButton.scss`. Replace `react-feather` X with `lucide-react` X. Replace `classnames` with `cn()`. Replace Bootstrap `close` class + CSS Module positioning with Tailwind utilities.

### 8c. `Toggle` — `src/views/components/Toggle.tsx`

No SCSS to delete. Replace Bootstrap `btn-group`/`btn`/`btn-primary`/`btn-outline-primary` with the new `<Button>` component. Replace `classnames` with `cn()`.

---

## Step 9: TypeScript Updates

**File:** `website/src/types/global.d.ts` — add CSS module declaration for `.css` imports:
```ts
declare module '*.css' {
  const content: { [className: string]: string };
  export = content;
}
```

`tsconfig.json` needs no changes — `baseUrl: "./src/"` already resolves `lib/utils` and `views/ui/*`.

---

## What Stays Unchanged (This Phase)

- All SCSS files in `src/styles/` and `src/views/` (except the 3 demo components)
- `bootstrap`, `classnames`, `react-feather`, `sass`, `sass-loader`, `@material/*` packages
- `.postcssrc.js`, `@mixin night-mode`, `body.mode-dark` CSS variable overrides
- SCSS-generated `.theme-{name} .color-{N}` classes
- Jest config / `identity-obj-proxy` SCSS mock

---

## Verification

1. `yarn start` — dev server starts, existing pages render correctly
2. `yarn build` — no build errors
3. Toggle dark mode in Settings — old + new components both switch
4. Change timetable theme — verify CSS variable theme classes work
5. Navigate to pages using Warning, CloseButton, Toggle — verify they render with shadcn/Tailwind styling
6. `yarn typecheck` — no new type errors
7. `yarn test` — existing tests pass

---

## Implementation Order

| # | Action | Files |
|---|--------|-------|
| 1 | Install packages | `package.json` |
| 2 | Create `postcss.tailwind.js` | new |
| 3 | Modify `webpack.parts.js` — change SCSS test to `/\.scss$/`, add Tailwind loaders | `webpack/webpack.parts.js` |
| 4 | Modify `webpack.config.dev.js` — add `loadTailwindCSS()` | `webpack/webpack.config.dev.js` |
| 5 | Modify `webpack.config.prod.js` — add `productionTailwindCSS()` | `webpack/webpack.config.prod.js` |
| 6 | Modify `webpack.config.timetable-only.js` — add `productionTailwindCSS()` | `webpack/webpack.config.timetable-only.js` |
| 7 | Create `src/styles/tailwind/globals.css` with shadcn CSS variables + NUSMods colors | new |
| 8 | Create `src/styles/tailwind/themes.css` with 12 timetable themes | new |
| 9 | Add Tailwind CSS imports to entry points | `src/entry/main.tsx`, `src/entry/export/main.tsx` |
| 10 | Add `.css` module declaration | `src/types/global.d.ts` |
| 11 | **Verify build works** (`yarn start`) | — |
| 12 | Create `src/lib/utils.ts` | new |
| 13 | Create `components.json` | new |
| 14 | Create standard shadcn components in `src/views/ui/` | new (5 files) |
| 15 | Modify `AppShell.tsx` — add `.dark` on `<html>` | `src/views/AppShell.tsx` |
| 16 | Modify export entry — add `documentElement.classList.toggle` | `src/entry/export/main.tsx` |
| 17 | Migrate `Warning.tsx`, delete `Warning.scss` | 2 files |
| 18 | Migrate `CloseButton.tsx`, delete `CloseButton.scss` | 2 files |
| 19 | Migrate `Toggle.tsx` | 1 file |
| 20 | **Final verification** (build, dark mode, tests, typecheck) | — |
