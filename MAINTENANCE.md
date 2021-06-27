# NUSMods Maintenance Notes

Create a new issue on GitHub with this checklist after the finals every semester.

## Every Year

- [ ] Update academic year and semester in `website/src/config/app-config.json`, and add current academic year to archive years
- [ ] In `app-config.json`, update `examAvailability` to include only the semesters where exam information is available
- [ ] Update with next year's holiday data from https://github.com/rjchow/singapore_public_holidays and delete old data, then run `scripts/holidays-csv-to-json.js`
- [ ] Update `website/src/data/academic-calendar.json` with data for the new academic year
- [ ] Add announcement to website
- [ ] Update academic year in `scrapers/nus-v2/src/config.ts`
- [ ] Ensure that scraper is scraping next AY's data
- [ ] On server: Update academic year in `export/.env`
- [ ] Deploy! :tada: :tada:
- [ ] Monitor Sentry and Messenger for issues

Reference PRs: [PR #3286](https://github.com/nusmodifications/nusmods/pull/3286) and [PR #3287](https://github.com/nusmodifications/nusmods/pull/3287)

## Every Semester

- [ ] Update semester in `website/src/config/app-config.json`
- [ ] In `app-config.json`, add semester to `examAvailability` to indicate exam information is available for the semester
- [ ] Update the ModReg schedule in `website/src/data/modreg-schedule-ayXXXX-semXX.json`, and point to the new version in `website/src/config/index.ts`  
      Reference PR: [PR #2764](https://github.com/nusmodifications/nusmods/pull/2764)
