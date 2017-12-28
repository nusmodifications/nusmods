import compose from 'koa-compose';

const handler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.log.error(error);

    if (error.isBoom) {
      ctx.body = error.output.payload;
      ctx.status = error.output.statusCode;

      return;
    }
    // TODO: Handle error that are not instance of `boom`

    throw error;
  }
};

export default () => compose([
  handler,
]);
