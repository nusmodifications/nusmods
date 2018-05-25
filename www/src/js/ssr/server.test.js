// @flow
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import cheerio from 'cheerio';
import axios from 'axios';

import CS1010S from '__mocks__/modules/CS1010S.json';
import moduleList from '__mocks__/moduleList.json';
import Server from './server';
import { mockResponse } from '../utils/test-util';

const MODULE_CODE = 'CS1010S';

// Get around React Side Effect freaking out because it mistakes JSDOM for
// the real DOM
jest.mock('exenv', () => ({
  canUseDOM: false,
}));

// Silence 'failed to create sync storage' console message from redux-persist
jest.mock('storage/persistReducer');

// Use the uncompiled index.html as the template
const template = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');

describe(Server, () => {
  let server: Server;

  beforeAll(() => {
    // Ensure IS_SSR env is set so
    process.env.IS_SSR = 'true';

    // Mock API so all data come locally
    beforeEach(() => {});
  });

  afterAll(() => {
    delete process.env.IS_SSR;
  });

  beforeEach(() => {
    server = new Server();
    server.template = template;

    jest.spyOn(axios, 'get').mockImplementation(async (url) => {
      if (url.endsWith(`${MODULE_CODE}.json`)) {
        return mockResponse(CS1010S);
      }

      if (url.endsWith('moduleList.json')) {
        return mockResponse(moduleList);
      }

      throw new Error(`Unknown url ${url} requested`);
    });
  });

  afterEach(() => {
    axios.get.mockRestore();
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

  test('should serve module info page', async () => {
    const response = await request(server.app.callback()).get(
      '/modules/CS1010S/programming-methodology',
    );
    const $ = cheerio.load(response.text);

    console.log(response.text.slice(5000, 10000));

    expect(axios.get.mock.calls).toHaveLength(2);

    expect(response.status).toEqual(200);
    expect($('h1').text()).toContain('CS1010S Programming Methodology');
  });

  test('should return 404 on a non-existent page', async () => {
    const response = await request(server.app.callback()).get('/does-not-exist');

    console.log(response.text.slice(5000, 10000));
    const $ = cheerio.load(response.text);
    expect($('h1').text()).toContain('page not found');

    expect(response.status).toEqual(404);
  });
});
