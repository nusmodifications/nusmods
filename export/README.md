# NUSMods Timetable Export Service

Uses [Puppeteer][puppeteer] to render a copy of the user's timetable on the server before taking a screenshot and sending it back to them. 

## Getting started 

```bash
# Install dependencies 
# To skip Puppeteer installing Chromium, set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
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

# Start export server - use "yarn devtools" if need to see the graphical browser with  
# developer tools. Note that PDF export does not work if this is set. 
cd ../export 
yarn dev
```

## Supported features

- Dark mode 
- Timetable orientation 
- Hidden modules
- Custom coloring 

## Process 

1. The user's client extracts the relevant slice of the Redux state necessary to render the timetable and serializes it into JSON  
2. The serialized state is added as query to the 'Download as' link the user sees when they open the dropdown menu 
3. When the user clicks on the link, the browser makes a GET request to the chosen export endpoint
4. The endpoint parses and validates the incoming data  
5. The export service uses the Puppeteer instance to create a new `Page` object
6. The page loads a special version of the app that only has the `<TimetableContent>` component, and injects the data into the Redux store 
7. The screenshot or PDF is taken of the page, and sent back to the user 

## API

Both export API endpoints accept GET requests and take a `data` query that consists of JSON encoded data in the shape of `ExportData`. 

The endpoints use `content-disposition` header to get the browser to download the file.

### GET `/pdf`

Download PDF of the timetable.

### GET `/image`

Download PNG image of the timetable. 

#### Parameters 

- `pixelRatio` (Number: 1 to 3 inclusive) - the device pixel ratio as reported in [`window.devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio). This scales the entire image by that amount  

### GET '/debug'

Returns the HTML content of the page that Puppeteer renders.

[puppeteer]: https://github.com/GoogleChrome/puppeteer
