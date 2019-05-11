const fs = require('fs-extra');
const Koa = require('koa');
const Router = require('koa-router');
const views = require('koa-views');
const gracefulShutdown = require('http-graceful-shutdown');
const Sentry = require('@sentry/node');
const _ = require('lodash');

const render = require('./render');
const data = require('./data');
const config = require('./config');

// Config check
if (process.env.NODE_ENV === 'production') {
  if (!config.moduleData) {
    throw new Error(
      'No moduleData path set - check config.js. ' +
        'This should be the path to the api/<academic year>/modules folder.',
    );
  }

  if (!fs.existsSync(config.moduleData) || !fs.lstatSync(config.moduleData).isDirectory()) {
    throw new Error(
      'moduleData path does not exist or is not a directory - check config.js. ' +
        'This should be the path to the api/<academic year>/modules folder.',
    );
  }

  if (!config.ravenDsn) {
    throw new Error('Raven DSN is not specified - check config.js');
  }
}

// Set up Raven
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: config.ravenDsn,
  });
}

// Start router
const app = new Koa();
const router = new Router();

router
  .get('/image', async (ctx) => {
    const { page, data } = ctx.state;
    const { height, width } = ctx.query;

    // Validate options
    let options = {
      pixelRatio: _.clamp(Number(ctx.query.pixelRatio) || 1, 1, 3),
    };

    if (
      typeof height !== 'undefined' &&
      typeof width !== 'undefined' &&
      !Number.isNaN(height) && // accept floats
      !Number.isNaN(width) && // accept floats
      height > 0 &&
      width > 0
    ) {
      options = {
        ...options,
        height: Number(height),
        width: Number(width),
      };
    }

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

    if (ctx.status === 404) {
      await ctx.render('404');
      ctx.status = 404;
    }
  } catch (e) {
    const eventId = Sentry.captureException(e.original || e);

    console.error(e);

    ctx.status = e.status || 500;

    if (ctx.status === 422) {
      await ctx.render('422');
    } else {
      await ctx.render('500', {
        eventId,
        dsn: config.publicDsn,
      });
    }

    ctx.app.emit('error', e, ctx);
  }
};

app
  .use(
    views(__dirname + '/views', {
      extension: 'pug',
    }),
  )
  .use(errorHandler)
  .use(data.parseExportData)
  .use(render.openPage)
  .use(router.routes())
  .use(router.allowedMethods());

// Wait for the browser to finish launching before starting the server
render
  .launch()
  .then(async (browser) => {
    // Attach the page and browser objects to context
    app.context.browser = browser;

    // Attach page content or URL
    if (/^https?:\/\//.test(config.page)) {
      app.context.pageUrl = config.page;
    } else {
      app.context.pageContent = await fs.readFile(config.page, 'utf-8');
    }

    const server = app.listen(process.env.PORT || 3000, process.env.HOST);
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
