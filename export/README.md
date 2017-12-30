# NUSMods Timetable Export Service

Uses [Puppeteer][puppeteer] to render a copy of the user's timetable on the server before taking a screenshot and sending it back to them. 

## Getting started 

```bash
# Install dependencies - to skip Puppeteer installing Chromium,
# Set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
# See https://github.com/GoogleChrome/puppeteer/blob/v0.13.0/docs/api.md#environment-variables
$ yarn 

# Configure 
$ cp config.example.js config.js  
$ vim config.js 

# Start the Webpack server for both the main web app and the standalone 
# timetable page used by the export service  
cd ../www
yarn start 
yarn start:export

# Start export server - use "yarn start" if you don't need the browser 
# developer tools. Note that PDF export does not work if this is set. 
cd ../export 
yarn dev
```

## API

Both API endpoints accept GET requests and take a `data` query that consists of JSON encoded data in the shape of `ExportData`. The endpoints use `content-disposition` header to get the browser to download the file.

Supports 

- Dark mode 
- Timetable orientation 
- Hidden modules    

### GET `/pdf`

Download PDF of the timetable.   

### GET `/image`

Download PNG image of the timetable. 

[puppeteer]: https://github.com/GoogleChrome/puppeteer
