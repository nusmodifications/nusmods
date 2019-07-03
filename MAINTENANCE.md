# NUSMods Maintenance Notes

Create a new issue on GitHub with this checklist after the finals every semester.

## Every Year

- [ ] On server: update academic year in `scrapers/nus-v2/src/config.ts`
- [ ] Ensure that scraper is scraping next AY's data
- [ ] Update academic year and semester in `app-config.json`, and add current academic year to archive years
- [ ] Update with next year's holiday data from https://github.com/rjchow/singapore_public_holidays and delete old data, then run `scripts/holidays-csv-to-json.js`
- [ ] Add announcement to website
- [ ] Update academic year in `api/search/src/index.ts`
- [ ] On server: Update academic year in export/.env
- [ ] Deploy! :tada: :tada:
- [ ] Monitor Sentry and Messenger for issues

## Every Semester

- [ ] Update semester in `app-config.json`
