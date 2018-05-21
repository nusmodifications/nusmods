// @flow
import fs from 'mz/fs';
import path from 'path';
import Koa, { type Middleware } from 'koa';
import chokidar from 'chokidar';
import ReactDOM from 'react-dom/server';
import Raven from 'raven';
import App from './App';
import configureStore from './configure-store';
import * as data from './data';

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  Raven.config('https://dd204e9197b242bf82cfcaafef0cfd5a@sentry.io/1210682').install();
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
        ctx.body = this.template;
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

    const store = configureStore();
    store.dispatch(await data.getModuleList());
    const html = ReactDOM.renderToString(App({ store, location: ctx.url }));
    const state = JSON.stringify(store.getState());

    // Zalgo have mercy on me
    ctx.body = template.replace(
      this.containerString,
      `<div id="app">${html}</div>
     <script>window.REDUX_STATE = ${state}</script>`,
    );
  };

  loadTemplate = () =>
    fs.readFile(this.templatePath, 'utf-8').then((file) => {
      this.template = file;
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
