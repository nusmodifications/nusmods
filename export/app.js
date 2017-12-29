const Koa = require('koa');
const Router = require('koa-router');
const render = require('./render');

const app = new Koa();
const router = new Router();

router
  .get('/image', async (ctx) => {
    ctx.body = await render.image(ctx.page, ctx.query);
    ctx.attachment('My Timetable.png');
  }).get('/pdf', async (ctx) => {
    ctx.body = await render.pdf(ctx.page, ctx.query);
    ctx.attachment('My Timetable.pdf');
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

    app.listen(process.env.PORT || 3000);
  })
  .catch((e) => {
    console.error('Cannot start browser:');
    console.error(e);
    process.exit(1);
  });
