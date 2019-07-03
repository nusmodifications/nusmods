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

- [ ] Find the first faculty MPE date. This is the deadline for updating module data
  - [ ] One week before the deadline, if no new data is available, email contacts at Registrar's Office / ComCen
- [ ] Start scraping and make sure at least there is one successful run
  - [ ] Update semester and available semester in `app-config.json`
  - [ ] Update export service config on the server
  - [ ] Create announcement
  - [ ] Test on staging
  - [ ] Deploy! :tada: :tada:
  - [ ] Monitor Sentry and Messenger for issues
- [ ] Update CORS schedule data and point `config.js` to the new JSON file
