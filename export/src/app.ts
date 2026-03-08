import Koa from 'koa';
import Router from 'koa-router';
import views from 'koa-views';
import * as Sentry from '@sentry/node';

import * as data from './data';
import config from './config';
import { parseViewportOptions } from './image-options';
import { renderImage } from './render-image';
import { renderPdf } from './render-pdf';
import type { State } from './types';

// Start router
const app = new Koa<State>();
const router = new Router({ prefix: '/api/export' });

router
  .get('/image', async (ctx) => {
    const { data } = ctx.state;
    const options = parseViewportOptions(ctx.query);

    ctx.body = await renderImage(data, options);

    ctx.attachment('My Timetable.png');
  })
  .get('/pdf', async (ctx) => {
    const { data } = ctx.state;

    ctx.body = await renderPdf(data);

    ctx.set('Content-Type', 'application/pdf');
    ctx.attachment('My Timetable.pdf');
  })
  .get('/debug', async (ctx) => {
    ctx.status = 501;
    ctx.body = 'Debug HTML is unavailable as browser renderer is disabled.';
  });

// Error handling
const errorHandler: Koa.Middleware<State> = async (ctx, next) => {
  try {
    await next();

    if (ctx.status === 404) {
      await ctx.render('404');
      ctx.status = 404;
    }
  } catch (error) {
    const eventId = Sentry.captureException(error.original || error);

    console.error(error);

    ctx.status = error.status || 500;

    if (ctx.status === 422) {
      await ctx.render('422');
    } else {
      await ctx.render('500', {
        dsn: config.sentryDsn,
        eventId,
      });
    }

    ctx.app.emit('error', error, ctx);
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
  .use(router.routes())
  .use(router.allowedMethods());

export default app;
