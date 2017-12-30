# NUSMods Timetable Export Service

Uses [Puppeteer][puppeteer] to render a copy of the user's timetable on the server before taking a screenshot and sending it back to them. 

### Getting started 

```bash
# Install dependencies - to skip Puppeteer installing Chromium,
# Set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
# See https://github.com/GoogleChrome/puppeteer/blob/v0.13.0/docs/api.md#environment-variables
$ yarn 

# Configure 
$ cp config.example.js config.js  
$ vim config.js 

# Start the Webpack server for both the main web app and
# the standalone timetable page used by the export service  
cd ../www
yarn start 
yarn start:export

# Start export server - remove DEVTOOLS=1 if you don't need the 
# browser developer tools   
cd ../export 
DEVTOOLS=1 yarn start
```

[puppeteer]: https://github.com/GoogleChrome/puppeteer
