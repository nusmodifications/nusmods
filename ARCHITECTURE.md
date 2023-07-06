# Architecture

NUSMods is a volunteer-run open source project. We don't work for NUS, and we don't get paid for this. As such, we have limited time and resources to work on this project. We want to make the best use of our time, and we want to make sure that the project is sustainable in the long run. As such, we have to make some decisions about how we build the project.

## Principles

1. Keep it pragmatically simple.
3. Make it easy to contribute.
2. Open source, open data, open community.
4. Have fun and learn something new.

These principles guide our decisions on what to build, how to build it, and how to work together. As such, we have landed on a stack that is entirely JavaScript-based, and we keep everything stateless and avoid servers and databases where possible. We do, however, encourage trying out new technologies and tools, as long as they don't violate our principles. In fact, many of our decisions are made to allow us to try out new technologies (e.g. React, serverless functions, etc.).

## Stack

### Frontend

- [React](https://facebook.github.io/react/) as our UI library.
- [Redux](http://redux.js.org/) as our state management library.
- [React Router](https://reactrouter.com/) for routing.
- [CSS Modules](https://github.com/css-modules/css-modules) for styling.
- [Cloudflare](https://www.cloudflare.com/) for hosting and CDN.

### Backend

- [Node.js](https://nodejs.org/en/) as our server runtime.
- [Vercel](https://vercel.com/) for hosting and serverless functions.
- [ElasticSearch](https://www.elastic.co/) for searching modules and venues.

### Dev Tools

- [TypeScript](https://www.typescriptlang.org/) for type safety.
- [ESLint](https://eslint.org/) for linting.
- [Prettier](https://prettier.io/) for code formatting.
- [Jest](https://jestjs.io/) for testing.
- [CircleCI](https://circleci.com/) for continuous integration.
- [Sentry](https://sentry.io/) for error reporting.
- [Webpack](https://webpack.js.org/) for bundling.
- [Yarn](https://yarnpkg.com/) for package management.

## Project Structure

| Folder    | Purpose                                                                            |
| --------- | ---------------------------------------------------------------------------------- |
| /website  | Houses the code for the https://nusmods.com website                                |
| /scrapers | Scripts that download module and timetable data from NUS to our server             |
| /export   | Contains a service which allows users to download the timetable as images and PDFs |
| /packages | Helper JavaScript libraries that can be reused by projects outside NUSMods         |

Some of these folders have their own READMEs that go into more detail about their purpose and how they work. You can find them in the respective folders.

Each folder is a separate project, with their own dependencies and build pipelines. Unfortunately, this means that we have to run `yarn install` in each folder, and we have to run `yarn build` in each folder to build the project. We wanted to use workspaces but installation times and complexity were too high.

Projects in the `/packages` folder are published to npm, and can be used by other projects outside of NUSMods. We use these packages to share code between our frontend and backend.

## Frontend

Our frontend is a single-page application (SPA) that is statically hosted, meaning that all the HTML, CSS and JavaScript is generated at build time and served as static files. This means that we don't have to run a server to serve the frontend, and we can host it on a CDN for better performance.

We build NUSMods before tools like [Next.js](https://nextjs.org/) existed, so we have a custom build pipeline that uses Webpack to bundle our JavaScript and CSS, and generates our HTML. While this has served us well, we are looking to migrate away to better tools.

In addition, we are still using React class components because hooks were not available when we started. Since there are no plans to rewrite the entire frontend, our migration strategy is to migrate components to hooks as we work on them.

Our SPA app queries data from our backend API, and caches it aggressively in the browser. We use Redux to manage our state, and we use Redux Thunk to handle asynchronous actions. This works fairly well for us as we don't have a lot of state to manage, and through Redux we have easy undo/redo for our timetable builder.

## Backend

Our "backend" is a serverless Node.js app that is hosted on Vercel. We use Vercel's serverless functions to handle API requests for our exported timetables.

Aside from that, we also have a few cron jobs that run periodically to fetch data from NUS and update our "database" of modules and venues. These cron jobs are served on NUS' servers. These cron jobs are written in Node.js.

We use ElasticSearch to index our modules and venues, and we use it to power our search. This used to be done on the frontend, but we moved it to the backend to improve search quality and performance. We use ElasticSearch's REST API to query the results, which are hosted on Elastic's servers.

## Data

Our "database" is a collection of JSON files that are generated by our cron jobs. We don't use a database because we would have to host it somewhere, and we don't want to have to manage a database. We also don't need to do any complex queries, so a database is overkill.

As such we don't have any data migrations, and we don't have to worry about data consistency. We just have to make sure that our cron jobs are working properly.

These files are hosted on Cloudflare CDN. Since we only have to serve Singapore, this isn't strictly necessary, but it does help with performance.
