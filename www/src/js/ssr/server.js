// @flow
import fs from 'mz/fs';
import path from 'path';
import Koa, { type Middleware } from 'koa';
import chokidar from 'chokidar';
import ReactDOM from 'react-dom/server';
import Helmet from 'react-helmet';
import Raven from 'raven';
import Mustache from 'mustache';

import type { PageTemplateData } from 'types/ssr';
import App from './App';
import configureStore from './configure-store';
import * as data from './data';
import placeholders from './placeholders';

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

  containerString = '<div id="app"></div>';

  constructor(templatePath: string = 'dist/index.html', port: number = 4000) {
    this.templatePath = templatePath;
    this.port = port;
    this.app = new Koa();

    // Define routes
    this.app.use(this.errorHandler);

    if (!isProduction) {
      this.app.use(this.proxyAssets);
    }

    this.app.use(this.ssr);
  }

  // Routes
  errorHandler: Middleware = async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      if (isProduction) {
        Raven.captureException(e);

        // If SSR failed for any reason, we fall back to the client side rendering template
        // TODO: Fix this
        // $FlowFixMe - let's assume template is defined for now
        ctx.body = Mustache.render(this.template, placeholders);
      } else {
        console.error(e); // eslint-disable-line no-console
        throw e;
      }
    }
  };

  proxyAssets: Middleware = async (ctx, next) => {
    if (/\.(css|png)$/.test(ctx.path)) {
      const dirname = path.dirname(this.templatePath);
      ctx.type = path.extname(ctx.path);
      ctx.body = fs.createReadStream(path.join(dirname, ctx.path));
    } else {
      await next();
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
    store.dispatch(await data.getModuleList());

    // Prepare HTML - view contains the HTML snippets to be injected into the
    // Mustache template
    const html = ReactDOM.renderToString(App({ store, location: ctx.url }));
    const view = renderHelmet(Helmet.renderStatic());
    view.app = html;
    const state = JSON.stringify(store.getState());
    view.script = `<script>window.REDUX_STATE = ${state}</script>`;

    ctx.body = Mustache.render(template, view);
  };

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
