# website/api/optimiser/

Go 1.23 timetable optimiser served as a Vercel Go function (`optimise.go` → `Handler`). `README.md` here is detailed and current: read its "Hard vs Soft Constraints" and "Scoring Constants" sections before changing the solver.

## Commands (run from this directory)

```bash
cp ../../src/data/venues.json _constants/venues.json   # required before build/test
go test ./_models ./_modules ./_solver                  # unit tests
go run ./_test/server/main.go -port 8020                # local server, POST /optimise
go test ./_test/.                                       # API tests, need the server above running
golangci-lint run && golangci-lint fmt                  # CI fails on lint or fmt diff
```

To use it from the website dev server, run `pnpm start:optimiser` and `pnpm start:local` in `website/`.

## Structure rules

- Every internal package dir **must** start with `_`. Otherwise Vercel tries to deploy it as a function.
- Import path is `github.com/nusmodifications/nusmods/website/api/optimiser/...`.
- `_constants/venues.json` is a generated copy. Edit `website/src/data/venues.json` instead.
- Module data is fetched live from `api.nusmods.com/v2` (`_constants.ModulesURL`), so tests in `_test/` need network access.

## Solver gotchas

- Hard constraints (free days, time window, pins) are enforced by **filtering slots** in `_modules/mergeAndFilterModuleSlots`. Soft constraints are **score penalties** in `_solver/scoreTimetableState`. Put new constraints in the right layer.
- Lower score is better. Scoring weights are in `_constants/constants.go` and were tuned against each other, so changing one changes the priority order (see README).
- Lesson ordering: pinned lessons go first, then fewest options first (MRV). Keep pins first, or a single-option lesson can steal a pinned slot.
- `DaysPerWeek = 7`; `DayIndex` 0–6 means Monday–Sunday.
- Known gap: if no candidate fits for a lesson, `beamSearch` silently skips it. `FillDefaultsAndGenerateShareableLinks` then re-inserts a default/pinned class **without conflict checking**. `validatePinnedSlots` also doesn't check pin-vs-pin overlaps, so conflicting pins can return a 200 with double-booked classes.
