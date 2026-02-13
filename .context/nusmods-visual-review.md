# NUSMods Visual & CSS Review

## 1. Styling Strategy Overview

**Primary approach:** CSS Modules (`.scss`) co-located with components. No CSS-in-JS.

| Method | Scope | Usage |
|--------|-------|-------|
| **CSS Modules + SCSS** | Component-scoped (hashed classes) | ~124 `.scss` files in `src/views/` |
| **Bootstrap 4.6.2** | Global (selective imports) | Grid, buttons, forms, utilities |
| **Material Design** | Global (3 components) | `@material/snackbar`, `@material/fab`, `@material/button` |
| **CSS Custom Properties** | Global (theming) | ~28 variables for light/dark mode |
| **Inline styles** | Component-local | ~13 instances, only for computed/dynamic values |
| **Global utility classes** | Global | `hoverable`, `color-*`, `workload-*-bg`, `scrollable`, etc. |

### Build Pipeline

Webpack config at `webpack/webpack.parts.js`:
- **Dev:** `style-loader` (in-memory)
- **Prod:** `MiniCssExtractPlugin` (extracted files, `assets/[name].[contenthash:8].css`)
- **CSS Modules:** Enabled only for `src/views/` (not `src/styles/`). Local ident: `[hash:base64:8]`
- **Loaders:** `css-loader` -> `postcss-loader` (autoprefixer + cssnano in prod) -> `sass-loader`
- **Linting:** Stylelint (`stylelint-config-standard` + `stylelint-config-prettier`) with 350+ property ordering rules via `stylelint-order`

### Import & Composition Patterns

```tsx
// Standard CSS Module import
import styles from './Component.scss';

// Conditional classes via classnames (207 of 238 .tsx files use this)
className={classnames(styles.container, 'btn btn-primary', {
  [styles.active]: isActive,
})}

// Composing global classes from within CSS Modules
.myClass {
  composes: btn btn-link btn-block from global;
}

// Referencing global classes from within CSS Modules
:global(.btn).moduleColor {
  width: $button-size;
}
```

`composes` from global is used in ~47 instances. `:global()` references appear in ~40 instances.

---

## 2. SCSS Infrastructure

### Directory Structure (`src/styles/`)

```
styles/
+-- main.scss                          # Entry point (imports everything)
+-- constants.scss                     # Layout, animation, z-index, theme colors, workload colors
+-- bootstrap/
|   +-- bootstrap.scss                 # Selective Bootstrap imports
|   +-- variable-overrides.scss        # Color, typography, form overrides
|   +-- function-overrides.scss        # sass:math compatibility
|   +-- style-override.scss            # Body, dropdown, alert overrides
+-- material/
|   +-- material.scss                  # @material/{button,snackbar,fab}
|   +-- variable-overrides.scss        # Material theme vars
+-- layout/
|   +-- site.scss                      # Page structure, responsive layout
+-- components/
|   +-- buttons.scss                   # .btn-svg, .btn-inline, .svg-small
|   +-- form.scss                      # Placeholder color
|   +-- kbd.scss                       # Keyboard key element
|   +-- select.scss                    # Mobile Safari select fix
|   +-- sentry.scss                    # Error reporter z-index
+-- utils/
|   +-- mixins.scss                    # 8 mixins (see below)
|   +-- functions.scss                 # workload(), nusmods-theme()
|   +-- css-variables.scss             # Light/dark mode CSS custom properties
|   +-- animations.scss                # 8 keyframe animations
|   +-- themes.scss                    # Theme color class generation
|   +-- workload.scss                  # Workload color utility classes
|   +-- scrollable.scss                # .scrollable, .scrollable-y
|   +-- modules-entry.scss             # Bootstrap entry point
+-- leaflet.scss                       # Leaflet map styles
+-- leaflet-gesture-handling.scss      # Map gesture overlay
+-- tippy/
    +-- tippy.css                      # Tooltip styles
```

### Bootstrap Customization

Selective imports (in `bootstrap/bootstrap.scss`) — only these are included:
- **Included:** reboot, type, images, grid, tables, forms, buttons, progress, dropdown, button-group, input-group, pagination, badge, alert, close, embed, flex, position, screenreaders, text
- **Excluded:** print, code, transitions, custom forms, nav/navbar, card, breadcrumb, jumbotron, media, list-group, modal, tooltip, popover, carousel, most utilities (bg, borders, display, sizing, spacing, visibility)

Variable overrides are applied _before_ Bootstrap's own variables load.

---

## 3. Design Tokens

### Colors

**Brand / Semantic:**

| Token | Value | Usage |
|-------|-------|-------|
| `$primary` | `#ff5138` | Primary actions, links, focus rings |
| `$danger` | `#b71c1c` | Destructive actions, errors |
| `$secondary` | `$gray` (`#69707a`) | Secondary buttons |
| `$light` | `$gray-lightest` (`#f3f5f8`) | Light backgrounds |
| `$dark` | `$gray-dark` (`#222324`) | Dark text, dark mode bg |

**Gray Scale:**

| Variable | Hex | CSS Var | Usage |
|----------|-----|---------|-------|
| `$gray-dark` | `#222324` | `--gray-dark` | Headings, dark mode bg |
| `$gray` | `#69707a` | `--gray` | Body text, icons |
| `$gray-mid` | `#848490` | `--gray-mid` | Secondary text |
| `$gray-light` | `#aeb1b5` | `--gray-light` | Placeholders, borders |
| `$gray-lighter` | `#d3d6db` | `--gray-lighter` | Dividers, subtle borders |
| `$gray-lightest` | `#f3f5f8` | `--gray-lightest` | Backgrounds, hover states |

**Workload Colors (5 types):**

| Type | Hex | Light Mode BG | Dark Mode BG |
|------|-----|---------------|--------------|
| Lecture | `#bbdefb` | `#bbdefb` | `darken(65%)` |
| Tutorial | `#dcedc8` | `#dcedc8` | `darken(65%)` |
| Laboratory | `#d7ccc8` | `#d7ccc8` | `darken(65%)` |
| Project | `#ffe0b2` | `#ffe0b2` | `darken(65%)` |
| Preparation | `#ffcdd2` | `#ffcdd2` | `darken(65%)` |

### Typography

| Token | Value | Notes |
|-------|-------|-------|
| Font family | System stack (Bootstrap default) | Leaflet overrides to `'Helvetica Neue', Arial, Helvetica, sans-serif` |
| `$font-size-xlg` | `2rem` | Large headings |
| `$font-size-s` | `0.85rem` | Small text |
| `$font-size-xs` | `0.75rem` | Extra small |
| `$font-size-xxs` | `0.65rem` | Tiny labels |
| `$sm-font-size-ratio` | `0.875` | Mobile body scales to 87.5% |
| `$headings-margin-bottom` | `1rem` | Heading spacing |

Font weights observed: `400` (default), `500` (semi-bold, rare), `700` (bold headings).
Line heights observed: `1.3` (tight), `1.4` (tooltips), `1.5` (default), `1.6` (nav links).

### Spacing

No formal spacing scale exists. Observed common values:

| Approximate Scale | Values Used | Notes |
|-------------------|-------------|-------|
| XS | `0.1rem`, `0.2rem` | Icon margins, badge gaps |
| S | `0.3rem`, `0.4rem`, `0.5rem` | Inner padding, small gaps |
| M | `0.6rem`, `0.7rem`, `0.75rem`, `0.8rem`, `1rem` | Component padding |
| L | `1.5rem`, `2rem` | Section spacing, large padding |
| XL | `3rem`, `4rem` | Layout-level spacing (navbar, body top) |

Flexbox `gap` usage: `0.5rem`, `1rem` (planner, optimiser).

### Layout Constants

| Token | Value | Notes |
|-------|-------|-------|
| `$navbar-height` | `3rem` | Also maintained in `Navtabs.jsx` |
| `$navtab-height` | `3rem` | |
| `$side-nav-width-md` | `4rem` | Tablet sidebar |
| `$side-nav-width-lg` | `10rem` | Desktop sidebar |
| `$navtab-shadow-height` | `0.8rem` | |

### Border Radius (all unique values observed)

| Value | Usage | Count |
|-------|-------|-------|
| `0.25rem` | Timetable cells, modals, color picker, optimiser forms | ~5 |
| `0.3rem` | Planner semester, notifications | ~2 |
| `0.35rem` | Module cards, planner modules | ~4 (most common for cards) |
| `0.5rem` | Planner year, optimiser buttons, results | ~4 |
| `0.75rem` | Optimiser result containers | ~1 |
| `0.8rem` | Today lesson cards | ~1 |
| `50%` | Circles (dots, spinners) | ~4 |
| `3px` | Keyboard key element | ~1 |
| `5px` | Color picker | ~1 |
| `6px` | Theme option | ~1 |

No standardized radius scale exists.

### Box Shadows (all unique values observed)

| Value | Usage |
|-------|-------|
| `0 0.2rem 0.25rem rgba(#000, 0.2)` | Before-lesson cards |
| `0 2px 6px rgba(#000, 0.25)` | Dropdown menus (light) |
| `0 2px 6px rgba(#000, 0.75)` | Dropdown menus (dark) |
| `0 2px 8px rgba(color, 0.2)` | Optimiser buttons |
| `0 3px 12px rgba(#000, 0.3)` | ModReg notifications |
| `0 3px 14px rgba(0, 0, 0, 0.4)` | Leaflet popups |
| `0 6px 20px rgba(color, 0.4)` | Optimiser hover |
| `0 6px 18px rgba(#000, 0.14), 0 1px 2px rgba(#000, 0.24)` | Venue |
| `0 6px 24px rgba(#000, 0.18)` | Venue |
| `inset 2px 2px 4px rgba(#000, 0.1)` | Inset shadows |
| `1px 1px 1px var(--gray)` | Keyboard key element |

No standardized shadow scale exists.

### Z-Index Scale (centralized in `constants.scss`)

| Z-Index | Component |
|---------|-----------|
| `9999` | Browser warning / Tippy tooltips |
| `2500` | Snackbar |
| `2000` | Sentry error reporter |
| `1500` | Modal |
| `970` | ModReg notification |
| `960` | Module select |
| `950` | Module finder search (sm) |
| `920` | Venue detail expanded |
| `910` | Dropdown |
| `900` | Navtabs |
| `890` | Navbar |
| `850` | Module finder search (md) |
| `800` | FAB |
| `760` | Venue map |
| `750` | Venue detail |
| `700` | Side menu |
| `690` | Side menu overlay |
| `200` | Timetable warning |
| `120` | Timetable scrolled day |
| `110` | Timetable selected cell |
| `95` | Timetable timing |
| `90` | Timetable day |
| `60` | Current time indicator |
| `30` | Timetable cell |

### Animations

**Easing Curves (Material Design):**

| Token | Value |
|-------|-------|
| `$material-standard-curve` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `$material-deceleration-curve` | `cubic-bezier(0, 0, 0.2, 1)` |
| `$material-acceleration-curve` | `cubic-bezier(0.4, 0, 1, 1)` |
| `$material-sharp-curve` | `cubic-bezier(0.4, 0, 0.6, 1)` |

**Durations:**

| Token | Mobile | Desktop |
|-------|--------|---------|
| Fullscreen | `0.375s` | `0.275s` |
| Entering | `0.225s` | `0.195s` |
| Exiting | `0.195s` | `0.175s` |

**Keyframe Animations (8 total in `animations.scss`):**

| Name | Description |
|------|-------------|
| `pulse` | Scale 1 -> 1.05 -> 1 (subtle throb) |
| `pulse-more` | Scale 1 -> 1.2 -> 1 (stronger throb) |
| `fadeIn` | Opacity 0 -> 1 |
| `zoomIn` | Scale 0.3 + fade in |
| `zoomOut` | Scale to 0.3 + fade out |
| `spin` | 360-degree rotation |
| `bounceInUp` | Slide up from offscreen with bounce |
| `shake` | Horizontal shake (10px) |

Plus component-specific: `grow` (optimiser spinner), `leaflet-gestures-fadein`.

---

## 4. Mixins

All defined in `src/styles/utils/mixins.scss`:

| Mixin | Purpose | Parameters |
|-------|---------|------------|
| `color($color)` | Module color cell styling (bg, border darken 20%, text darken 40%, hover darken 10%) | `$color` |
| `mobile-landscape` | Targets small screens in landscape (max-height: 15rem) | None |
| `scrollable` | Overflow auto + iOS `-webkit-overflow-scrolling: touch` | None |
| `scrollable-y` | Vertical-only variant of scrollable | None |
| `touchscreen-only` | Targets `pointer: coarse` devices | None |
| `touchscreen-or-breakpoint-down($bp)` | Targets touch OR small viewport | `$breakpoint` (default `sm`) |
| `night-mode` | Wraps content in `:global(.mode-dark) &` | None |
| `vertical-mode` | Wraps content in `:global(.verticalMode) &` | None |

Bootstrap's `media-breakpoint-up()` and `media-breakpoint-down()` are also used extensively.

---

## 5. Dark Mode Implementation

**Toggle mechanism:**
1. User preference stored in Redux (`state.settings.colorScheme`): `SYSTEM` | `LIGHT` | `DARK`
2. `useColorScheme()` hook resolves preference + `prefers-color-scheme` media query -> `LIGHT_COLOR_SCHEME` | `DARK_COLOR_SCHEME`
3. `AppShell.tsx` applies `mode-dark` class to `<body>` and `mdc-theme--dark` for Material components

**CSS implementation:** CSS custom properties on `:root` (light) and `body.mode-dark` (dark):

| Variable | Light | Dark |
|----------|-------|------|
| `--body-bg` | `#f3f5f8` | `#222324` |
| `--body-color` | `#69707a` | `#aaa` |
| `--gray` | `#69707a` | `#aaa` |
| `--gray-mid` | `#848490` | `#7d7d7d` |
| `--gray-light` | `#aeb1b5` | `#666` |
| `--gray-lighter` | `#d3d6db` | `#474747` |
| `--gray-lightest` | `#f3f5f8` | `#292929` |
| `--gray-dark` | `#222324` | inverted |
| `--navtab-shadow` | `rgba(0,0,0,0.1)` | `rgba(0,0,0,0.26)` |
| Alert variables | `theme-color-level($name, -10/-7/6)` | `theme-color-level($name, 9/6/-6)` |
| Workload bg | `$color` | `darken($color, 65%)` |
| Workload text | `darken($color, 50%)` | `darken($color, 30%)` |

**Component dark mode styles:** Applied via `@include night-mode { ... }` mixin in CSS Modules, or via `var(--*)` references that auto-switch.

**Potential dark mode gaps:** Leaflet map styles use hardcoded colors (`#fff`, `#333`, `#ddd`, `#ccc`) that don't respond to theme changes. SVG data URIs in select dropdowns also use hardcoded `rgb(170, 170, 170)`.

---

## 6. Responsive Design

### Breakpoints (Bootstrap standard)

| Name | Min-width | Typical usage |
|------|-----------|---------------|
| `xs` | 0 | Mobile-first base |
| `sm` | 576px | Small phones |
| `md` | 768px | Tablets |
| `lg` | 992px | Desktops |
| `xl` | 1200px | Large desktops |

### Key Responsive Behaviors

**Body:** `padding-top: 4rem` (desktop) -> `$navbar-height` (3rem, mobile). Font size scales to `87.5%` on `sm`.

**Navigation:**
- `sm`: Horizontal bottom tabs, `position: sticky`, shadow via `::after`
- `md`: Vertical sidebar, `width: 4rem`, icon-only
- `xl`: Expanded sidebar, `width: 10rem`, icon + label

**Side menu:**
- `md+`: Sticky sidebar with overflow scroll
- `sm`: FAB trigger + bottom drawer with `translateY` animation

**Content:** `padding-left` adjusts for sidebar width (`0` -> `4rem` -> `10rem`).

**Safe area:** `padding: env(safe-area-inset-*)` for notch support.

### React-side Responsiveness

`useMediaQuery` hook (in `src/views/hooks/useMediaQuery.ts`) uses `window.matchMedia` with helpers:
- `breakpointUp('md')`, `breakpointDown('sm')`
- `prefersColorScheme('dark')`
- `touchScreenOnly()`
- Supports combining multiple queries

---

## 7. Theme Color System

### 12 Timetable Themes (8 colors each)

Defined in `src/styles/constants.scss` as `$nusmods-theme-colors` map. Must stay in sync with `src/data/themes.json`.

| Theme | Color 0 | Color 1 | Color 2 | Color 3 | Color 4 | Color 5 | Color 6 | Color 7 |
|-------|---------|---------|---------|---------|---------|---------|---------|---------|
| ashes | `#c7ae95` | `#c7c795` | `#aec795` | `#95c7ae` | `#95aec7` | `#ae95c7` | `#c795ae` | `#c79595` |
| chalk | `#fb9fb1` | `#eda987` | `#ddb26f` | `#acc267` | `#12cfc0` | `#6fc2ef` | `#e1a3ee` | `#deaf8f` |
| eighties | `#f2777a` | `#f99157` | `#fc6` | `#9c9` | `#6cc` | `#69c` | `#c9c` | `#d27b53` |
| google | `#cc342b` | `#f96a38` | `#fba922` | `#198844` | `#3971ed` | `#79a4f9` | `#a36ac7` | `#ec9998` |
| mocha | `#cb6077` | `#d28b71` | `#f4bc87` | `#beb55b` | `#7bbda4` | `#8ab3b5` | `#a89bb9` | `#bb9584` |
| monokai | `#f92672` | `#fd971f` | `#f4bf75` | `#a6e22e` | `#a1efe4` | `#66d9ef` | `#ae81ff` | `#c63` |
| ocean | `#bf616a` | `#d08770` | `#ebcb8b` | `#a3be8c` | `#96b5b4` | `#8fa1b3` | `#b48ead` | `#ab7967` |
| oceanic-next | `#ec5f67` | `#f99157` | `#fac863` | `#99c794` | `#5fb3b3` | `#69c` | `#c594c5` | `#ab7967` |
| paraiso | `#ef6155` | `#f99b15` | `#fec418` | `#48b685` | `#5bc4bf` | `#06b6ef` | `#815ba4` | `#e96ba8` |
| railscasts | `#da4939` | `#cc7833` | `#ffc66d` | `#a5c261` | `#519f50` | `#6d9cbe` | `#b6b3eb` | `#bc9458` |
| tomorrow | `#c66` | `#de935f` | `#f0c674` | `#b5bd68` | `#8abeb7` | `#81a2be` | `#b294bb` | `#a3685a` |
| twilight | `#cf6a4c` | `#cda869` | `#f9ee98` | `#8f9d6a` | `#afc4db` | `#7587a6` | `#9b859d` | `#9b703f` |

**Application flow:**
1. Redux stores `state.theme.id` (default: `eighties`)
2. `AppShell.tsx` applies `theme-${id}` class to `<body>`
3. SCSS generates `.theme-{name} .color-{0..7}` via `@each` loop + `color()` mixin
4. Each `.color-N` gets: `background-color`, `border-color: darken(20%)`, `color: darken(40%)`, hover: `background-color: darken(10%)`

---

## 8. Component Patterns & Reuse Opportunities

### Buttons

**Current implementations:**

| Variant | Classes / Approach | Examples |
|---------|--------------------|----------|
| Primary action | `btn btn-primary` | Save, Submit, Add module |
| Secondary action | `btn btn-outline-primary` | Reset, alternate actions |
| Link/text button | `btn btn-link` | Cancel, inline actions |
| Icon + text | `btn btn-svg` (custom flex) | Delete, Random module |
| Close button | `.close` + react-feather X | `CloseButton` component |
| FAB | `mdc-fab` (Material) | Floating action button |
| Toggle group | `btn-group` + active/outline | `Toggle`, `ButtonGroupSelector` |
| Full-width | `btn btn-block` | Various mobile views |
| Fully custom | Inline styles + custom SCSS | `OptimiserButton` (has its own border-radius, shadow, hover transform) |

**Inconsistencies:**
- `OptimiserButton` bypasses Bootstrap entirely with custom `border-radius: 0.5rem`, `box-shadow`, `transform: translateY(-2px)` hover
- `DeleteButton` uses `border-radius: 0.35rem` (different from OptimiserButton's `0.5rem`)
- No unified "icon button" component — each instance re-implements flex layout

**Opportunity:** A single `<Button variant="primary|secondary|outline|link|icon|danger" size="sm|md|lg" block>` component wrapping Bootstrap classes + icon layout would eliminate inconsistencies.

### Dropdowns / Selects

**Current implementations:**

| Type | Library | Example |
|------|---------|---------|
| Split button dropdown | Bootstrap + Downshift | `AddModuleDropdown` (semester selection) |
| Search-select dropdown | Custom + Downshift | `DropdownListFilters` (desktop filters) |
| Native `<select>` | HTML | `DropdownListFilters` (mobile fallback) |
| Simple button switcher | Custom links | `SemesterSwitcher` |

**Inconsistencies:**
- Search input in dropdown uses `border-radius: 0` while other inputs use standard corners
- No shared dropdown component — each use case reinvents the pattern
- Mobile falls back to native `<select>` via breakpoint detection, but the responsive switch is embedded in each component

**Opportunity:** A unified `<Dropdown>` or `<Select>` component with `searchable`, `native` (mobile), and `split` variants.

### Cards / Panels

**Current implementations:**

| Card Type | Border | Radius | Shadow | Padding |
|-----------|--------|--------|--------|---------|
| Module card (MPE) | `1px solid var(--gray-lighter)` | `0.35rem` | none | varies |
| Planner module | `border-bottom: 0.15rem solid` (status-colored) | `0.35rem` | none | `0.6rem 0.7rem` |
| Today lesson card | `border-bottom: 0.3rem solid` (module-colored) | `0.8rem` | none | `0.6rem 1rem` |
| Before-lesson card | `1px solid var(--gray-lighter)` | implicit | `0 0.2rem 0.25rem rgba(#000, 0.2)` | varies |
| ModReg notification | `1px solid theme-color()` | `0.3rem` | `0 3px 12px rgba(#000, 0.3)` | `0.6rem 3rem 0.6rem 1rem` |

**Inconsistencies:** Border radius varies from `0.3rem` to `0.8rem`. Shadow treatment is inconsistent. Padding varies per card.

**Opportunity:** A `<Card>` component with `variant="bordered|elevated|accent"` and consistent radius + spacing.

### Badges / Tags

| Type | Classes | Radius |
|------|---------|--------|
| Semester badge | `badge` + custom `.sem{1-4}` | `1px` (nearly square) |
| Status badge (MPE) | `badge badge-info`, `badge badge-warning` | Bootstrap default (`0.25rem`) |
| Exam calendar | `composes: badge badge-primary from global` | Bootstrap default |

**Inconsistency:** Semester badges use `border-radius: 1px` while all others use Bootstrap's `0.25rem`.

### Forms

| Element | Implementation |
|---------|---------------|
| Text inputs | `form-control` (Bootstrap), `form-control-lg`/`form-control-sm` for sizes |
| Checkboxes | `form-check` + `form-check-input`/`form-check-label` (Bootstrap) |
| Selects | Native `<select class="form-control">` |
| Toggle | Custom 2-button group (`btn btn-primary` / `btn btn-outline-primary`) |
| Placeholder | `color: var(--gray-light)` via `form.scss` |
| Focus ring | `$input-focus-border-color: $primary` (`#ff5138`) |

Mobile Safari gets special select handling (custom SVG arrow, `-webkit-appearance: none`).

### Loading States

| Type | Implementation |
|------|---------------|
| Full spinner | `LoadingSpinner` component — CSS border animation with `spin` keyframe. 4rem default, 1.1rem `small` variant. Themed to `$primary`. |
| White spinner | `.white` variant for dark backgrounds |
| Button loading | Text change + custom `grow` animation (OptimiserButton only) |
| Add state | Text change ("Adding...") |
| No skeleton loaders | Not implemented anywhere |

### Empty States

| Type | Implementation |
|------|---------------|
| Empty planner semester | Dashed border box (`1px dashed var(--gray-light)`, `0.3rem` radius) |
| Module not offered | Flex row with archive icon + text |
| Error pages | Full-page with `react-kawaii` illustration |

No standardized empty state component exists.

### Icons

**Primary library:** `react-feather` (100+ icon imports across the codebase).

| Pattern | Implementation |
|---------|---------------|
| Icon + text button | `.btn-svg` (inline-flex, icon `margin-right: 0.2rem`) |
| Standalone icon | Sized via CSS (typically inherits parent) |
| Icon color | Inherits from parent `color`; some override `fill` directly |
| Custom SVGs | `/img/icons/` for illustrations (beach, books, compass, etc.) |

---

## 9. Hardcoded Color Audit

**119 unique hex colors** found across SCSS files. The vast majority are in the 12 theme palettes (96 colors) and the gray scale. Notable hardcoded colors outside variables:

| Color | Location | Issue |
|-------|----------|-------|
| `#fff`, `#333`, `#ddd`, `#ccc`, `#777` | `leaflet.scss` | Don't respond to dark mode |
| `#0078a8` | `leaflet.scss` (link color) | Hardcoded, not from palette |
| `#38f` | `leaflet.scss` (zoom box border) | Hardcoded |
| `#c3c3c3` | `leaflet.scss` (disabled control) | Hardcoded |
| `rgb(170, 170, 170)` | `select.scss` (SVG data URI) | Embedded in SVG |
| `#2c2c2c` | `SemesterBadge.scss` (dark mode base) | Not from gray scale |

---

## 10. Summary of Improvement Opportunities

### Standardize Design Tokens

The codebase would benefit from a formal token system:

```scss
// Spacing scale (currently ad-hoc)
$space-1: 0.25rem;  // 4px
$space-2: 0.5rem;   // 8px
$space-3: 0.75rem;  // 12px
$space-4: 1rem;     // 16px
$space-6: 1.5rem;   // 24px
$space-8: 2rem;     // 32px

// Border radius scale (currently 7+ different values)
$radius-sm: 0.25rem;
$radius-md: 0.375rem;  // Normalize 0.3/0.35/0.4 to one value
$radius-lg: 0.5rem;
$radius-xl: 0.75rem;
$radius-full: 50%;

// Shadow scale (currently 10+ unique values)
$shadow-sm: 0 1px 3px rgba(#000, 0.12);
$shadow-md: 0 2px 8px rgba(#000, 0.2);
$shadow-lg: 0 6px 20px rgba(#000, 0.2);
```

### Create Shared UI Components

| Component | Consolidates |
|-----------|-------------|
| `<Button>` | Bootstrap btn classes + icon layout + hover effects |
| `<Card>` | Module cards, lesson cards, notification cards |
| `<Dropdown>` | Downshift dropdowns, split buttons, native selects |
| `<Badge>` | Semester badges, status badges |
| `<EmptyState>` | Dashed-border box, icon+message patterns |
| `<Skeleton>` | Currently non-existent; needed for perceived perf |

### Address Dark Mode Gaps

- Leaflet styles need CSS variable integration
- SVG data URIs need dark-mode-aware colors
- `#2c2c2c` in SemesterBadge should use `--gray-dark` or similar

### Reduce Inconsistencies

- Border radius: Normalize to 2-3 standard values
- Shadows: Define an elevation scale
- Button styling: `OptimiserButton` and `DeleteButton` should use shared patterns
- Padding: Converge on spacing scale tokens
