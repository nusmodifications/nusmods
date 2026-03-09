# NUSMods Timetable Export Service

Uses [Puppeteer][puppeteer] to render a copy of the user's timetable on the server before taking a screenshot and sending it back to them.

## Getting started

### Local development

```bash
# Install dependencies
# To skip Puppeteer installing Chromium, set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
# See https://github.com/GoogleChrome/puppeteer/blob/v0.13.0/docs/api.md#environment-variables
$ pnpm install

# Configure - the defaults are sufficient for development, but for
# production these need to be updated
$ cp .env.example .env
$ vim .env

# Start the Webpack server for both the main web app and the standalone
# timetable page used by the export service
$ cd ../website
$ pnpm start
$ pnpm start:export

# Start export server - use "pnpm devtools" if need to see the graphical browser with
# developer tools. Note that PDF export does not work in devtools mode.
$ cd ../export
$ pnpm dev
```

## Supported features

- Dark mode
- Timetable orientation
- Hidden modules
- Custom coloring

## Process

1. The user's client extracts the relevant slice of the Redux state necessary to render the timetable and serializes it into JSON
1. The serialized state is added as query params to the 'Download as' link the user sees when they open the dropdown menu
1. When the user clicks on the link, the browser makes a GET request to the chosen export endpoint
1. The endpoint parses and validates the incoming data
1. The export service uses the Puppeteer instance to create a new `Page` object
1. The page loads a special version of the app that only has the `<TimetableContent>` component, and injects the data into the Redux store
1. The screenshot or PDF is taken of the page, and sent back to the user

## API

Both export API endpoints accept GET requests and take a `data` query param that consists of JSON encoded data in the shape of `ExportData`.

The endpoints use `content-disposition` header to get the browser to download the file.

### GET `/pdf`

Download PDF of the timetable.

#### Parameters

- `data` - JSON encoded timetable data

### GET `/image`

Download PNG image of the timetable.

#### Parameters

- `data` - JSON encoded timetable data
- `pixelRatio = 1` (Number: 1 to 3 inclusive) - the device pixel ratio as reported in [`window.devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio). This scales the entire image by that amount so it will appear correctly when downloaded to the user's device.

### GET `/debug`

Returns the HTML content of the page that Puppeteer renders.

## Testing

After running locally, you can test with the following URLs on `localhost:3000`:

- [Example image export](http://localhost:3000/image?data=%7B%22semester%22%3A2%2C%22timetable%22%3A%7B%22CS3217%22%3A%7B%22Lecture%22%3A%5B0%2C3%5D%2C%22Tutorial%22%3A%5B1%5D%7D%2C%22CS1010%22%3A%7B%22Tutorial%22%3A%5B4%5D%2C%22Sectional%20Teaching%22%3A%5B3%5D%7D%2C%22CS1231S%22%3A%7B%22Tutorial%22%3A%5B2%5D%2C%22Lecture%22%3A%5B6%2C7%5D%7D%2C%22CS4218%22%3A%7B%22Lecture%22%3A%5B0%5D%2C%22Laboratory%22%3A%5B4%5D%7D%7D%2C%22colors%22%3A%7B%22CS3217%22%3A4%2C%22CS1010%22%3A6%2C%22CS1231S%22%3A5%2C%22CS4218%22%3A0%7D%2C%22hidden%22%3A%5B%5D%2C%22ta%22%3A%5B%5D%2C%22theme%22%3A%7B%22id%22%3A%22mocha%22%2C%22timetableOrientation%22%3A%22HORIZONTAL%22%2C%22showTitle%22%3Afalse%2C%22_persist%22%3A%7B%22version%22%3A-1%2C%22rehydrated%22%3Atrue%7D%7D%2C%22settings%22%3A%7B%22colorScheme%22%3A%22LIGHT_COLOR_SCHEME%22%7D%7D&pixelRatio=2)
- [Example PDF export](http://localhost:3000/pdf?data=%7B%22semester%22%3A2%2C%22timetable%22%3A%7B%22CS3217%22%3A%7B%22Lecture%22%3A%5B0%2C3%5D%2C%22Tutorial%22%3A%5B1%5D%7D%2C%22CS1010%22%3A%7B%22Tutorial%22%3A%5B4%5D%2C%22Sectional%20Teaching%22%3A%5B3%5D%7D%2C%22CS1231S%22%3A%7B%22Tutorial%22%3A%5B2%5D%2C%22Lecture%22%3A%5B6%2C7%5D%7D%2C%22CS4218%22%3A%7B%22Lecture%22%3A%5B0%5D%2C%22Laboratory%22%3A%5B4%5D%7D%7D%2C%22colors%22%3A%7B%22CS3217%22%3A4%2C%22CS1010%22%3A6%2C%22CS1231S%22%3A5%2C%22CS4218%22%3A0%7D%2C%22hidden%22%3A%5B%5D%2C%22ta%22%3A%5B%5D%2C%22theme%22%3A%7B%22id%22%3A%22mocha%22%2C%22timetableOrientation%22%3A%22HORIZONTAL%22%2C%22showTitle%22%3Afalse%2C%22_persist%22%3A%7B%22version%22%3A-1%2C%22rehydrated%22%3Atrue%7D%7D%2C%22settings%22%3A%7B%22colorScheme%22%3A%22LIGHT_COLOR_SCHEME%22%7D%7D&pixelRatio=2)

## Deployment

The export service is deployed on Vercel for production.

For deployment of website/export services, use Vercel project settings.

### Self-hosting (optional)

If you need to run this service outside Vercel, you can still run the Node server
manually (for example with PM2).

In production the app runs behind pm2 in addition to nodemon, so the app will automatically restart when its files are changed or if the app crashes.

Export depends on build artifacts from `website`, including the timetable-only bundle.
Use `pnpm rsync:export <target-dir>` from the `website` folder to sync the
timetable-only build to your target environment.

Here are the steps for deploying. We rsync everything over, including the `node_modules`, so it is not necessary to run `pnpm install` in the production folder.

```bash
# Update the files from the repo
$ git pull

# Install dependencies and build
$ pnpm install
$ pnpm build

# Deploy the files to production - optionally add --dry-run to check which files are changed first
$ pnpm deploy

# Starting the app, if the app is not already running
# Uses port 3300 for production and 3301 for staging
$ pnpm start
```

[puppeteer]: https://github.com/GoogleChrome/puppeteer
