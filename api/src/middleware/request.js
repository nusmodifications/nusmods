import compose from 'koa-compose';

const logger = async (ctx, next) => {
  ctx.log.info(`request from ${ctx.request.ip} to ${ctx.path}`);
  await next();
};

export default () => compose([
  logger,
]);
