import pug from 'pug';
import config from './config';

const viewsRoot = __dirname + '/views';

export function render422() {
  return pug.renderFile(`${viewsRoot}/422.pug`);
}

export function render500(eventId: string) {
  return pug.renderFile(`${viewsRoot}/500.pug`, {
    eventId,
    dsn: config.sentryDsn,
  });
}
