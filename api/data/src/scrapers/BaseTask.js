// @flow
import bunyan from 'bunyan';
import bluebird from 'bluebird';
import fs from 'fs-extra';

import db from '../db';
import http from './HttpService';
import config from '../../config';

/**
 * Base class for all scraping tasks, contains useful utilities
 * such as logging and writing of files.
 *
 * @class BaseTask
 */
export default class BaseTask {
  constructor() {
    this.log = bunyan.createLogger({
      name: this.constructor.name,
      level: process.env.NODE_ENV === 'production' ? bunyan.INFO : bunyan.DEBUG,
    });
    this.http = http;
    this.db = db;
  }

  getTransaction() {
    return bluebird.promisify(this.db.transaction);
  }

  /**
   * Simple write function to the disk.
   *
   * @param {string} pathToWrite absolute path to write to
   * @param {Object} data json object to write
   * @param {bunyan} [log=this.log] logger, defaults to this.log
   * @memberof BaseTask
   */
  writeJson(pathToWrite: string, data: Object, log = this.log) {
    log.info(`saving to ${pathToWrite}`);
    fs.outputJson(pathToWrite, data, { spaces: config.jsonSpace });
  }
}
