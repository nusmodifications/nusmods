import bunyan from 'bunyan';
import fs from 'fs-extra';

import BaseTask from './BaseTask';

jest.mock('fs-extra');
jest.unmock('bunyan');

describe('BaseTask', () => {
  let base;
  beforeAll(() => {
    base = new BaseTask();
  });

  describe('constructor', () => {
    let env; // restore env
    beforeEach(() => {
      env = process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env.NODE_ENV = env;
    });

    it('should generate a log object', () => {
      expect(base.log.fields.name).toBe('BaseTask');
    });

    it('should generate log at debug level when not production', () => {
      expect(base.log.level()).toBe(bunyan.DEBUG);
    });

    it('should generate log at info level when production', () => {
      process.env.NODE_ENV = 'production';
      base = new BaseTask();
      expect(base.log.level()).toBe(bunyan.INFO);
    });
  });

  describe('writeJson', () => {
    it('should output with log', () => {
      base.log = {
        info: jest.fn(),
      };

      base.writeJson('x');

      expect(base.log.info).toHaveBeenCalled();
    });

    it('should output json to file', () => {
      base.writeJson('x.json', {});
      expect(fs.outputJson).toHaveBeenCalled();
    });
  });
});
