const fs = require('fs-extra');
const Koa = require('koa');
const Router = require('koa-router');
const gracefulShutdown = require('http-graceful-shutdown');
const Raven = require('raven');
const _ = require('lodash');

const render = require('./render');
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
    ctx.body = await render.image(ctx.page, ctx.query.data, _.omit(ctx.query, ['data']));
    ctx.attachment('My Timetable.png');
  })
  .get('/pdf', async (ctx) => {
    ctx.body = await render.pdf(ctx.page, ctx.query.data);
    ctx.attachment('My Timetable.pdf');
  })
  .get('/debug', async (ctx) => {
    ctx.body = await ctx.page.content();
  });

// Error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    if (ctx.page) {
      await ctx.page.reload();
    }

    throw e;
  }
});

app.on('error', (err) => {
  Raven.captureException(err);
  console.error(err);
});

app
  .use(router.routes())
  .use(router.allowedMethods());

// Wait for the browser to finish launching before starting the server
render.launch()
  .then(([browser, page]) => {
    // Attach the page and browser objects to context
    app.context.page = page;
    app.context.browser = browser;

    const server = app.listen(process.env.PORT || 3000);
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
