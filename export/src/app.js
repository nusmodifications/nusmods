const Koa = require('koa');
const Router = require('koa-router');
const views = require('koa-views');
const Sentry = require('@sentry/node');
const _ = require('lodash');

const render = require('./render');
const data = require('./data');
const config = require('./config');

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
        dsn: config.sentryDsn,
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

module.exports = app;
