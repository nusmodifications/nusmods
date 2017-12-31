const fs = require('fs-extra');
const Koa = require('koa');
const Router = require('koa-router');
const gracefulShutdown = require('http-graceful-shutdown');
const Raven = require('raven');
const _ = require('lodash');

const render = require('./render');
const data = require('./data');
const config = require('./config');

// Config check
if (process.env.NODE_ENV === 'production') {
  if (!config.moduleData) {
    throw new Error('No moduleData path set - check config.js. ' +
      'This should be the path to the api/<academic year>/modules folder.');
  }

  if (!fs.existsSync(config.moduleData) || !fs.lstatSync(config.moduleData).isDirectory()) {
    throw new Error('moduleData path does not exist or is not a directory - check config.js. ' +
      'This should be the path to the api/<academic year>/modules folder.');
  }

  if (!config.ravenDsn) {
    throw new Error('Raven DSN is not specified - check config.js');
  }
}

// Set up Raven
Raven.disableConsoleAlerts();
Raven.config(process.env.NODE_ENV === 'production' && config.ravenDsn)
  .install({
    captureUnhandledRejections: true,
    autoBreadcrumbs: true,
  });

// Start router
const app = new Koa();
const router = new Router();

router
  .get('/image', async (ctx) => {
    const { page, data } = ctx.state;
    const options = _.omit(ctx.query, ['data']);

    ctx.body = await render.image(page, data, options);
    ctx.attachment('My Timetable.png');
  })
  .get('/pdf', async (ctx) => {
    const { page, data } = ctx.state;

    ctx.body = await render.pdf(page, data);
    ctx.attachment('My Timetable.pdf');
  })
  .get('/debug', async (ctx) => {
    ctx.body = await ctx.state.page.content();
  });

// Error handling
const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    Raven.captureException(e, {
      req: ctx.req,
    });

    console.error(e);
    ctx.status = e.status || 500;
    ctx.app.emit('error', e, ctx);
  }
};

app
  .use(errorHandler)
  .use(data.parseExportData)
  .use(render.openPage)
  .use(router.routes())
  .use(router.allowedMethods());

// Wait for the browser to finish launching before starting the server
render.launch()
  .then(async (browser) => {
    // Attach the page and browser objects to context
    app.context.browser = browser;

    // Attach page content or URL
    if (/^https?:\/\//.test(config.page)) {
      app.context.pageUrl = config.page;
    } else {
      app.context.pageContent = await fs.readFile(config.page, 'utf-8');
    }

    const server = app.listen(process.env.PORT || 3000);
    console.log('Export server started');

    gracefulShutdown(server);
  })
  .catch((e) => {
    console.error('Cannot start browser:');
    console.error(e);

    if (e.message.includes('ERR_CONNECTION_REFUSED')) {
      console.error('Check that the export page dev server has been started');
    }

    process.exit(1);
  });
