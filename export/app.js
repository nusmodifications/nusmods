const Koa = require('koa');
const Router = require('koa-router');
const gracefulShutdown = require('http-graceful-shutdown');
const render = require('./render');
const config = require('./config');

// Config check
if (process.env.PRODUCTION) {
  if (!config.moduleData) {
    throw new Error('No moduleData path set - check config.js. ' +
      'This should be the path to the api/<academic year>/modules folder.');
  }
}

// Start router
const app = new Koa();
const router = new Router();

router
  .get('/image', async (ctx) => {
    ctx.body = await render.image(ctx.page, ctx.query.data);
    ctx.attachment('My Timetable.png');
  })
  .get('/pdf', async (ctx) => {
    ctx.body = await render.pdf(ctx.page, ctx.query.data);
    ctx.attachment('My Timetable.pdf');
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
