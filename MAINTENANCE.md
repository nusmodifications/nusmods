# NUSMods Maintenance Notes

Create a new issue on GitHub with this checklist after the finals every semester.

## Every Year

### Around End of Semester 2

- [ ] Rotate `GITHUB_API_TOKEN`, which expires after 366 days, and update it in both deployment platforms:
  - [ ] In the [Cloudflare workers](https://github.com/nusmodifications/serverless-functions), update the token on the Cloudflare dashboard and grant write permissions under [Issues](https://docs.github.com/en/rest/issues/issues?apiVersion=2026-03-10#create-an-issue) for the `nusmods` repository so venue issues can be created.
  - [ ] In Vercel, update the token for both the `nusmods-website` and `nusmods-export` projects so fork PR builds can be identified by `vercel_ignore_build.sh`. The token is used by the projects' ignored build step, not by either service at runtime.

### 1 week before NUS IT Data Update

- **Prepare "PR1"**
  - [ ] Update `packages/nusmods-academic-calendar/academic-calendar.json` with data for the new academic year so scraper and website Special Term overlap routing remains correct
  - [ ] Update with next year's holiday data from academic calendar to `website/src/data/holidays.json` - Singapore & NUS Holidays (e.g. Well-Being day): <https://www.nus.edu.sg/registrar/calendar>
  - [ ] Update academic year in `scrapers/nus-v2/src/config.ts`

- **Prepare "PR2"**
  - [ ] In `app-config.json`, update `academicYear` and `examAvailability` to include only the semesters where exam information is available
  - [ ] Update `packages/nusmods-academic-calendar/academic-calendar.json` with data for the new academic year
  - [ ] Add announcement to website by updating `website/src/views/components/notfications/Announcements.tsx`
  - [ ] Leave `specialTermAcademicYear` as `null` — overlap with previous AY Special Term I and II is handled automatically until new AY Semester 1 starts (see PR3). Set manually (e.g. `"2024/2025"`) only if auto-detection from the academic calendar is insufficient
  - [ ] Update `semester` in `app-config.json` and the ModReg schedule (see [Every Semester](#every-semester))

### 1-2 days before NUS IT Data Update

- [ ] **Merge "PR1"**
- [ ] Push PR1 to production

### Day of NUS IT Data Update

- [ ] Ensure that scraper is scraping next AY's data. You can do so by checking the locally published JSON files, or visiting `https://api.nusmods.com/v2/20XX-20XX/` (e.g. [https://api.nusmods.com/v2/2022-2023/](https://api.nusmods.com/v2/2022-2023/))
- [ ] On Vercel or `.env`: Update academic year in export service's environment variables
- [ ] **Merge "PR2"** to Master > Production
- [ ] Deploy! :tada: :tada:
- [ ] Monitor Sentry and Telegram for issues

### 1 week before new AY Semester 1 starts

PR2 is usually merged around July, while previous AY Special Term I and II run until new AY Semester 1 starts. During this window, sem 1–2 use the new AY and sem 3–4 continue to use the previous AY automatically — no action needed unless `specialTermAcademicYear` was set manually in PR2.

- **Prepare "PR3"**
  - [ ] Ensure `specialTermAcademicYear` is `null` (overlap ends when Semester 1 starts per `packages/nusmods-academic-calendar/academic-calendar.json`)
  - [ ] Add the previous academic year to `archiveYears` in `website/src/config/app-config.json` so course historical-data links include it

### When new AY Semester 1 starts

- [ ] **Merge "PR3"** to Master > Production
- [ ] Deploy and monitor Sentry and Telegram for issues

Reference PRs: [PR #3286](https://github.com/nusmodifications/nusmods/pull/3286) and [PR #3287](https://github.com/nusmodifications/nusmods/pull/3287)

## Every Semester

- [ ] Update semester in `website/src/config/app-config.json`
- [ ] Update the ModReg schedule in `website/src/data/modreg-schedule.json`, and make sure the correct version is pointed to in `website/src/config/index.ts`
  - Reference PR: [PR #2764](https://github.com/nusmodifications/nusmods/pull/2764)

## CPEx

### Prepare scraper data

- [ ] Set `ACADEMIC_YEAR` in [`scrapers/cpex-scraper/src/index.ts`](scrapers/cpex-scraper/src/index.ts) to the academic year of the upcoming CPEx round
- [ ] Merge the scraper update before running it; follow [`scrapers/cpex-scraper/AGENTS.md`](scrapers/cpex-scraper/AGENTS.md) for the command and required environment
- [ ] Keep this scraper work separate from the website availability change below

### Configure and test the website

- [ ] Before editing the staging configuration, sync `cpex-staging` to the latest `master`:

  ```bash
  git switch master
  git pull --ff-only
  git switch cpex-staging
  git reset --hard master
  git push --force-with-lease origin cpex-staging
  ```

  This deliberately resets the staging branch to `master`; do not run it if that branch has unmerged work.

- [ ] Set `MPE_AY` and `MPE_SEMESTER` in [`website/src/views/mpe/constants.ts`](website/src/views/mpe/constants.ts) to the academic year and semester being configured
- [ ] Keep the last NUS-confirmed window in `cpexWindow` between rounds. After NUS confirms the next dates, update the shared `cpexWindow` in [`website/src/data/modreg-schedule.json`](website/src/data/modreg-schedule.json) to ISO 8601 timestamps with the Singapore `+08:00` offset, and update `MPE_AY` and `MPE_SEMESTER` together. Availability includes `start` and excludes `end`; do not clear the previous window after it ends
- [ ] Commit and push these website changes to `cpex-staging` to deploy the preview
- [ ] On <https://cpex-staging.nusmods.com/cpex>, verify NUS authentication and complete a staging form submission. Staging stays available for testing regardless of the configured window

### Before CPEx Opens

- [ ] Confirm `cpexWindow` matches NUS's announced opening and closing times
- [ ] Keep `disableCPExForProd` false in [`website/src/featureFlags.ts`](website/src/featureFlags.ts); this is an emergency-only switch
- [ ] After staging checks pass, open a PR from `cpex-staging` to `master`; merge it and deploy to production before `cpexWindow.start` using [`DEPLOYMENT.md`](DEPLOYMENT.md#website-and-export-vercel)
- [ ] Before the window starts, confirm the CPEx tab is hidden, `/cpex` shows the opening time, and MPE submission requests are blocked; these behaviors are implemented in [`Navtabs.tsx`](website/src/views/layout/Navtabs.tsx), [`MpeContainer.tsx`](website/src/views/mpe/MpeContainer.tsx), and [`mpe.ts`](website/src/serverless/mpe.ts)

### During CPEx

- [ ] Confirm the CPEx tab and form become available at `cpexWindow.start`; check that a submission succeeds
- [ ] Monitor Sentry and Telegram for issues

### Emergency shutdown

- If CPEx must be stopped during an active window, set `disableCPExForProd` to `true` in [`website/src/featureFlags.ts`](website/src/featureFlags.ts), merge the emergency change, and deploy it to production
- Restore it to `false` after the incident; the configured schedule will continue to control normal availability

### After CPEx

- [ ] At `cpexWindow.end`, confirm the tab is hidden, `/cpex` shows the ended status, and MPE submission requests are blocked
- CPEx closes automatically; no normal closeout PR or flag change is needed
- Continue scraper preparation and runs as a separate maintenance task
