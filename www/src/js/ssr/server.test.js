// @flow
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import cheerio from 'cheerio';
import Server from './server';

// Get around React Side Effect freaking out because it mistakes JSDOM for
// the real DOM
jest.mock('exenv', () => ({
  canUseDOM: false,
}));

// Silence 'failed to create sync storage' console message from redux-persist
jest.mock('storage/persistReducer');

const template = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');

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
    server.template = template;
  });

  test('should serve /faq', async () => {
    const response = await request(server.app.callback()).get('/faq');
    const $ = cheerio.load(response.text);

    expect(response.status).toEqual(200);
    expect($('h2').text()).toContain('Frequently Asked Questions');
    expect($('title').text()).toContain('FAQ');
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
