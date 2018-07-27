NUSMods Maintainace Notes
=========================

Create a new issue on GitHub with this checklist after the finals every semester.

## Every Year 

- [ ] Update academic year in `app-config.json` 
- [ ] Update with next year's holiday data and delete old data 

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

