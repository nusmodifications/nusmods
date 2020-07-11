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

## Every Semester

- [ ] Update semester in `website/src/config/app-config.json`
- [ ] In `app-config.json`, add semester to `examAvailability` to indicate exam information is available for the semester
