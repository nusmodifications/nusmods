// @flow
import fs from 'mz/fs';
import Koa, { type Middleware } from 'koa';
import chokidar from 'chokidar';
import ReactDOM from 'react-dom/server';
import Helmet from 'react-helmet';
import Raven from 'raven';
import Mustache from 'mustache';

import type { PageTemplateData } from 'types/ssr';
import config from 'config';
import App from './App';
import configureStore from './configure-store';
import getDataLoaders from './routes';
import placeholders from './placeholders';
import assetProxy from './middlewares/assetProxy';
import cache from './middlewares/cache';
import time from './middlewares/time';

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  Raven.config('https://dd204e9197b242bf82cfcaafef0cfd5a@sentry.io/1210682').install();
}

function renderHelmet(helmet): PageTemplateData {
  return {
    htmlAttributes: helmet.htmlAttributes.toString(),
    bodyAttributes: helmet.bodyAttributes.toString(),
    titleTag: helmet.title.toString(),
    metaTags: helmet.meta.toString(),
    linkTags: helmet.link.toString(),
  };
}

export default class Server {
  templatePath: string;
  template: ?string;
  port: number;
  app: Koa;

  constructor(templatePath: string = config.ssr.template, port: number = 4000) {
    this.templatePath = templatePath;
    this.port = port;
    this.app = new Koa();

    // Define middlewares
    this.app.use(time);
    this.app.use(this.errorHandler);

    if (isProduction) {
      this.app.use(cache());
    } else {
      this.app.use(assetProxy(this.templatePath));
    }

    this.app.use(this.ssr);
  }

  /**
   * Middleware
   */
  errorHandler: Middleware = async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      console.error(e); // eslint-disable-line no-console

      if (isProduction) {
        Raven.captureException(e, { req: ctx.req });

        // If SSR failed for any reason, we fall back to the client side rendering template
        // TODO: Fix this
        // $FlowFixMe - let's assume template is defined for now
        ctx.body = Mustache.render(this.template, placeholders);
      } else {
        throw e;
      }
    }
  };

  ssr: Middleware = async (ctx) => {
    const template = this.template;
    if (typeof template !== 'string') {
      ctx.throw(500, 'Server is not ready yet, come back in a bit');
      return;
    }

    // Prepare data
    const store = configureStore();
    await Promise.all(getDataLoaders(ctx.path).map((loader) => loader(store)));

    // Prepare HTML - view contains the HTML snippets to be injected into the
    // Mustache template
    const context = {};
    const html = ReactDOM.renderToString(App({ store, context, location: ctx.url }));

    // Check for redirect
    if (context.url) {
      ctx.redirect(context.url);
      return;
    }

    if (context.status) {
      ctx.status = context.status;
    }

    const view = renderHelmet(Helmet.renderStatic());
    view.app = html;
    const state = JSON.stringify(store.getState());
    view.script = `<script>window.REDUX_STATE = ${state}</script>`;

    ctx.body = Mustache.render(template, view);
  };

  /**
   * Templates
   */
  loadTemplate = () =>
    fs.readFile(this.templatePath, 'utf-8').then((file) => {
      this.template = file;

      Mustache.clearCache();
      Mustache.parse(file);
    });

  startServer() {
    chokidar.watch(this.templatePath).on('change', this.loadTemplate);
    this.loadTemplate().then(() => this.app.listen(this.port));
  }
}

if (require.main === module) {
  const server = new Server();
  server.startServer();
}
