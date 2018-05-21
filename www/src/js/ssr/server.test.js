// @flow
import request from 'supertest';
import Server from './server';

describe(Server, () => {
  let server: Server;

  beforeAll(() => {
    process.env.IS_SSR = 'true';
  });

  afterAll(() => {
    delete process.env.IS_SSR;
  });

  beforeEach(() => {
    server = new Server();
    server.template = server.containerString;
  });

  test('should serve /faq', async () => {
    const response = await request(server.app.callback()).get('/faq');
    expect(response.status).toEqual(200);
  });

  test('should serve /team', async () => {
    const response = await request(server.app.callback()).get('/team');
    expect(response.status).toEqual(200);
  });

  test('should return 404 on a non-existent page', async () => {
    const response = await request(server.app.callback()).get('/does-not-exist');
    expect(response.status).toEqual(404);
  });
});
