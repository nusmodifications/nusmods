# NUSMods Timetable Export Service

Renders timetables server-side using Satori and sends them back as images or PDFs.

## Getting started

### Local development

```bash
# Install dependencies
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

# Start export server
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
1. The export service renders the timetable using Satori (SVG) and converts it to the requested format
1. The screenshot or PDF is sent back to the user

## API

Both export API endpoints accept GET requests and take a `data` query param that consists of JSON encoded data in the shape of `ExportData`.

The endpoints use `content-disposition` header to get the browser to download the file.

### GET `/api/export/pdf`

Download PDF of the timetable.

#### Parameters

- `data` - JSON encoded timetable data

### GET `/api/export/image`

Download PNG image of the timetable.

#### Parameters

- `data` - JSON encoded timetable data
- `pixelRatio = 1` (Number: 1 to 3 inclusive) - the device pixel ratio as reported in [`window.devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio). This scales the entire image by that amount so it will appear correctly when downloaded to the user's device.

## Deployment

The export service is deployed on Vercel for production.

For deployment of website/export services, use Vercel project settings.

### Self-hosting (optional)

If you need to run this service outside Vercel, you can still run the Node server
manually.

Export depends on build artifacts from `website`, including the timetable-only bundle.
Use `pnpm rsync:export <target-dir>` from the `website` folder to sync the
timetable-only build to your target environment.

Here are the steps for deploying.

```bash
# Update the files from the repo
$ git pull

# Install dependencies and build
$ pnpm install
$ pnpm build

# Start the app
$ pnpm start
```
