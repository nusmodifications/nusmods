# NUSMods Website Codebase Review

## 1. Routes & Navigation

**Router:** React Router v5.3.4 with `BrowserRouter`, flat routing (no nesting).

**Route definitions:** `src/views/routes/Routes.tsx` — 28 routes total in a single `<Switch>`.

| Route | Component | Notes |
|-------|-----------|-------|
| `/` | Redirect → `/timetable` | Landing page |
| `/timetable/:semester?/:action?` | TimetableContainer | Main feature |
| `/courses` | ModuleFinderContainer | Lazy-loaded |
| `/courses/:moduleCode/:slug?` | ModulePageContainer | Canonical URL redirect |
| `/modules/:moduleCode/:slug?` | ModulePageContainer | Legacy route |
| `/venues/:venue?` | VenuesContainer | Deferred render |
| `/today` | TodayContainer | Lazy-loaded + preload |
| `/planner` | PlannerContainer | Lazy-loaded |
| `/optimiser` | OptimiserContainer | Beta feature flag |
| `/settings` | SettingsContainer | Deferred render |
| `/about`, `/faq`, `/team`, etc. | Static pages | No data fetching |
| `*` | NotFoundPage | Catch-all 404 |

**Key patterns:**

- **Code splitting**: `react-loadable` with `retryImport()` — chunks named `today`, `planner`, `module-finder`, `contribute`, `optimiser`, `venue`, `tetris`, `tooltip`
- **Preloading on hover**: Navtabs preloads Today, Venues, Contribute on `onMouseOver`/`onFocus` (`src/views/layout/Navtabs.tsx`)
- **Deferred render**: `deferComponentRender` HOC (`src/views/hocs/deferComponentRender.tsx`) delays expensive components by 2 animation frames — used on Settings, Venues, ModuleArchive
- **Programmatic navigation**: `useHistory().push()` throughout, plus keyboard shortcuts (`y`=Today, `t`=Timetable, `m`=Courses, `v`=Venues, `s`=Settings, `/`=Search) in `src/views/components/KeyboardShortcuts.tsx`
- **History debouncing**: `src/utils/HistoryDebouncer.ts` — prevents history pollution during rapid filter changes (30s window, first push, subsequent replaces)
- **Path helpers**: `src/views/routes/paths.ts` — `timetablePage()`, `modulePage()`, `venuePage()`, `moduleArchive()`
- **No route guards** — fully public app, no auth

---

## 2. Styling Methods

**Primary approach:** CSS Modules + SCSS, co-located with components.

| Method | Usage | Examples |
|--------|-------|---------|
| **CSS Modules (`.scss`)** | ~130+ files, primary method | `Component.scss` alongside `Component.tsx`, imported as `styles` |
| **Bootstrap 4.6.2** | Selectively imported | Grid, buttons (`btn`, `btn-primary`), forms (`form-control`, `form-check`), utilities (`text-muted`, `sr-only`) |
| **Material Design** | 2 components | `@material/snackbar` for Notification, `@material/fab` for FAB |
| **Inline styles** | ~5 instances only | Only for dynamic values (e.g., computed colors) |

**SCSS infrastructure (`src/styles/`):**

- **Design tokens**: `constants.scss` — Material Design timing curves, animation durations, component heights
- **22+ mixins**: Responsive breakpoints, dark mode, touch detection
- **12 color theme palettes** with 8 colors each (96 combinations) for timetable theming
- **Dark mode**: CSS custom properties toggled via `mdc-theme--dark` class, driven by user preference or system setting
- **Responsive**: Breakpoint system via `useMediaQuery` hook + SCSS media query mixins, mobile-first approach
- **Linting**: Stylelint with 350+ property ordering rules
- **Class composition**: `classnames` library used in 50+ components for conditional class application

**No CSS-in-JS** (styled-components, emotion, etc.) is used.

---

## 3. Component Classification

**Directory structure** (`src/views/`):

```
views/
├── components/          # 70+ reusable UI primitives
│   ├── filters/         # CheckboxItem, ChecklistFilter, DropdownListFilters
│   ├── module-info/     # AddModuleDropdown, ModuleWorkload, LessonTimetable
│   ├── map/             # LocationMap, BusStops, ExpandMap (Leaflet)
│   ├── notfications/    # Notification, Announcements (typo in dir name)
│   ├── Tooltip/         # Tippy.js wrapper
│   ├── disqus/          # DisqusComments, CommentCount
│   └── (base components: Modal, Toggle, SearchBox, CloseButton, etc.)
├── layout/              # Navtabs, Footer, GlobalSearch, SideMenu
├── hocs/                # makeResponsive (deprecated), deferComponentRender, withTimer
├── hooks/               # useMediaQuery, useColorScheme, useCurrentTime, useScrollToTop
├── timetable/           # Timetable feature
├── modules/             # Course finder & details
├── planner/             # Degree planner
├── venues/              # Venue search
├── today/               # Today's lessons
├── settings/            # Preferences
├── optimiser/           # Schedule optimiser
└── static/              # About, FAQ, Team, etc.
```

**Top reusable components by usage:**

| Component | Usages | Library |
|-----------|--------|---------|
| LoadingSpinner | 21 | Pure CSS |
| ExternalLink | 18 | Native |
| Title | 16 | Native |
| Modal | 12 | react-modal + body-scroll-lock |
| CloseButton | 12 | react-feather X icon |
| Tooltip | 11 | @tippy.js/react |
| Toggle | 3 | Bootstrap button group |
| SearchBox | 2 | lodash debounce |

**External UI libraries:**

| Library | Purpose |
|---------|---------|
| `downshift` | Headless dropdowns (AddModuleDropdown, DropdownListFilters) |
| `react-modal` | Modal dialog base |
| `@tippy.js/react` | Tooltips/popovers |
| `react-feather` | Icons (100+) |
| `react-beautiful-dnd` | Drag & drop |
| `react-leaflet` | Maps |
| `searchkit` | Elasticsearch UI for module finder filters |
| `react-kawaii` | Cute placeholder illustrations |

**Component patterns:** Mix of class components (SearchBox, Notification, AddModuleDropdown — older code) and functional components with hooks (Toggle, SideMenu, Navtabs — newer code). `React.memo()` used selectively.

---

## 4. State Management

**Global state:** Redux 4.2.1 (traditional, NOT Redux Toolkit).

**Store setup:** `src/bootstrapping/configure-store.ts` — `createStore()` + `applyMiddleware([ravenMiddleware, thunk, requestsMiddleware])`.

**State tree (8 reducers):**

| Reducer | Persisted | Key Data |
|---------|-----------|----------|
| `moduleBank` | Yes | Module catalog, module details (LRU cache, max 100), archive modules |
| `venueBank` | Yes | Venue list data |
| `timetables` | Yes | Semester lessons, colors, hidden/TA modules. Custom reconciler archives old year on academic year change |
| `theme` | Yes | Theme ID, timetable orientation, title display |
| `settings` | Yes | Faculty, color scheme, beta flag, ModReg notifications |
| `planner` | Yes | Year range, planned modules, custom modules |
| `requests` | No | API request statuses (REQUEST/SUCCESS/FAILURE) per key |
| `app` | No | Active lesson, online status, notification queue, feedback modal |
| `undoHistory` | No | Undo/redo stacks (limit: 1, watches REMOVE_MODULE and SET_TIMETABLE) |

**Persistence:** redux-persist 6.0.0 → localStorage. 6 of 8 reducers persisted. `PersistGate` defers render until rehydration. Timetables reducer has a custom state reconciler and migration handlers (v0→v1→v2).

**Data fetching:** Custom middleware pattern (`src/middlewares/requests-middleware.ts`):

1. `requestAction()` creates action with `meta[API_REQUEST]` flag
2. Middleware intercepts, dispatches `TYPE_REQUEST`, makes axios call
3. Dispatches `TYPE_SUCCESS` or `TYPE_FAILURE`
4. `requests` reducer tracks status per key
5. Selectors: `isOngoing()`, `isSuccess()`, `isFailed()`

No React Query, SWR, or Apollo.

**Selectors:** `reselect` for memoization (`src/selectors/`) — `getSemesterTimetableLessons`, `getModuleCondensed`, request status helpers.

**Component connection:** ~98% hooks (`useSelector`/`useDispatch`), ~2% legacy `connect()` HOC (DisqusComments, CommentCount).

**Context API:** Minimal — only `MapContext` for map expansion signaling, not for global state.

**Local state:** ~81 `useState` instances. Zero `useReducer`. Custom hooks: `useOptimiserForm` (5 form fields), `useColorScheme` (Redux + system preference), `useCurrentTime` (interval + visibility API).

**URL state:** React Router params (`useParams`, `useLocation`) + `query-string` library for timetable sharing, venue search filters, module search queries.
