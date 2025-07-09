# NUSMods Maintenance Notes

Create a new issue on GitHub with this checklist after the finals every semester.

## Every Year

### 1 week before NUS IT Data Update

- **Prepare "PR1"**
  - [ ] Update with next year's holiday data from academic calendar to `website/src/data/holidays.json` - Singapore & NUS Holidays (e.g. Well-Being day): <https://www.nus.edu.sg/registrar/calendar>
  - [ ] Update academic year in `scrapers/nus-v2/src/config.ts`
- **Prepare "PR2"**
  - [ ] In `app-config.json`, update `examAvailability` to include only the semesters where exam information is available
  - [ ] Update `website/src/data/academic-calendar.json` with data for the new academic year
  - [ ] Add announcement to website by updating `website/src/data/holidays.json`

### 1-2 days before NUS IT Data Update

- [ ] **Merge "PR1"**
- [ ] Push PR1 to production

### Day of NUS IT Data Update

- [ ] Ensure that scraper is scraping next AY's data. You can do so by checking the locally published JSON files, or visiting `https://api.nusmods.com/v2/20XX-20XX/` (e.g. [https://api.nusmods.com/v2/2022-2023/](https://api.nusmods.com/v2/2022-2023/))
- [ ] On Vercel or `.env`: Update academic year in export service's environment variables
- [ ] **Merge "PR2"** to Master > Production
- [ ] Deploy! :tada: :tada:
- [ ] Monitor Sentry and Telegram for issues

Reference PRs: [PR #3286](https://github.com/nusmodifications/nusmods/pull/3286) and [PR #3287](https://github.com/nusmodifications/nusmods/pull/3287)

## Every Semester

- [ ] Update semester in `website/src/config/app-config.json`
- [ ] In `app-config.json`, add semester to `examAvailability` to indicate exam information is available for the semester
- [ ] Update the ModReg schedule in `website/src/data/modreg-schedule.json`, and make sure the correct version is pointed to in `website/src/config/index.ts`
  - Reference PR: [PR #2764](https://github.com/nusmodifications/nusmods/pull/2764)

## CPEx

- Before
  - [ ] Update `TERM` in `scrapers/cpex-scraper/src/index.ts` and `MPE_SEMESTER` in `website/src/views/mpe/constants.ts` to be the semester you're configuring CPEx for (usually the next semester)
  - [ ] Update the displayed dates in `website/src/views/mpe/MpeContainer.tsx` and any new requirements/descriptions
  - [ ] Update dates in the ModReg schedule in `website/src/data/modreg-schedule.json`
  - [ ] Enable the `enableCPExforProd` and `showCPExTab` flags in `website/src/featureFlags.ts`
  - [ ] Push onto `cpex-staging` branch (Ensure synced with `master` branch first), then visit https://cpex-staging.nusmods.com/cpex and verify that NUS authentication is working
- During
  - [ ] Merge `cpex-staging` into `master`
  - [ ] Deploy latest `master` to `production`
- After
  - [ ] Disable the `enableCPExforProd` and `showCPExTab` flags in `website/src/featureFlags.ts`
  - [ ] Merge into `master`
  - [ ] Deploy latest `master` to `production`
