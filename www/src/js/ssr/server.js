// @flow
import fs from 'mz/fs';
import path from 'path';
import Koa from 'koa';
import chokidar from 'chokidar';
import ReactDOM from 'react-dom/server';
import App from './App';
import configureStore from './configure-store';
import * as data from './data';

// Load HTML template
const templatePath = 'dist/index.html';
let template: string;

const loadTemplate = () =>
  fs.readFile(templatePath, 'utf-8').then((file) => {
    template = file;
  });

chokidar.watch(templatePath).on('change', loadTemplate);

const app = new Koa();

app
  .use(async (ctx, next) => {
    // Development proxy for static CSS and JS files
    if (process.env.NODE_ENV !== 'production' && /\.(css|png)$/.test(ctx.path)) {
      const dirname = path.dirname(templatePath);
      ctx.type = path.extname(ctx.path);
      ctx.body = fs.createReadStream(path.join(dirname, ctx.path));
    } else {
      await next();
    }
  })
  .use(async (ctx) => {
    const store = configureStore();
    store.dispatch(await data.getModuleList());
    const html = ReactDOM.renderToString(App({ store, location: ctx.url }));
    const state = JSON.stringify(store.getState());

    // Zalgo have mercy on me
    ctx.body = template.replace(
      '<div id="app"></div>',
      `<div id="app">${html}</div>
     <script>window.REDUX_STATE = ${state}</script>`,
    );
  });

// Start server
loadTemplate().then(() => app.listen(4000));
