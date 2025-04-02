# NUSMods Maintenance Notes

Create a new issue on GitHub with this checklist after the finals every semester.

## Every Year

- [ ] Update academic year and semester in `website/src/config/app-config.json`, and add current academic year to archive years
- [ ] In `app-config.json`, update `examAvailability` to include only the semesters where exam information is available
- [ ] Update with next year's holiday data from https://github.com/rjchow/singapore_public_holidays and delete old data, then run `scripts/holidays-csv-to-json.js`
- [ ] Update `website/src/data/academic-calendar.json` with data for the new academic year
- [ ] Add announcement to website
- [ ] Update academic year in `scrapers/nus-v2/src/config.ts`
- [ ] Ensure that scraper is scraping next AY's data. You can do so by checking the locally published JSON files, or visiting `https://api.nusmods.com/v2/20XX-20XX/` (e.g. [https://api.nusmods.com/v2/2022-2023/](https://api.nusmods.com/v2/2022-2023/))
- [ ] On Vercel or `.env`: Update academic year in export service's environment variables
- [ ] Deploy! :tada: :tada:
- [ ] Monitor Sentry and Messenger for issues

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
  - [ ] Enable the `enabledCPEx` and `showCPExTab` flags in `website/src/featureFlags.ts`
  - [ ] Push onto `cpex-staging` branch, then visit https://cpex-staging.nusmods.com/cpex and verify that NUS authentication is working
- During
  - [ ] Merge into `master`
  - [ ] Deploy latest `master` to `production`
- After
  - [ ] Disable the `enabledCPEx` and `showCPExTab` flags in `website/src/featureFlags.ts`
  - [ ] Merge into `master`
  - [ ] Deploy latest `master` to `production`
