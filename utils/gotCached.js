import path from 'path';
import fs from 'fs-promise';
import url from 'url';
import got from 'got';
import parse5 from 'parse5';
import isBinaryPath from 'is-binary-path';
import bunyan from 'bunyan';

const log = bunyan.createLogger({name: 'gotCached'});

/**
 * Converts URL to equivalent valid filename.
 */
function getCachePath(urlStr, cachePath) {
  const fileUrl = url.parse(urlStr);
  const hostname = encodeURIComponent(fileUrl.hostname);
  const restOfPath = encodeURIComponent(fileUrl.path + fileUrl.hash);
  return path.join(cachePath, encodeURIComponent(urlStr));
}

/**
 * Gets the time the file was last modified if it exists, null otherwise.
 */
async function getFileModifiedTime(cachedPath, url) {
  try {
    const stats = await fs.stat(cachedPath);
    if (stats.isFile()) {
      return stats.mtime;
    }
  } catch (err) {
    log.info(`no cached file for ${cachedPath}`);
  }
  return null;
}

async function gotCached(url, config) {
  const cachedPath = getCachePath(url, config.cachePath);
  const modifiedTime = await getFileModifiedTime(cachedPath, url);

  const maxCacheAge = config.maxCacheAge;
  const isCachedFileValid = modifiedTime &&
    (maxCacheAge === -1 || modifiedTime > Date.now() - maxCacheAge * 1000);
  if (isCachedFileValid) {
    log.info(`returning cached file for ${url}`);
    return await fs.readFile(cachedPath);
  }

  const options = {
    url,
    // returns body as a buffer instead of string if its a binary file
    encoding: isBinaryPath(url) ? null : 'utf-8',
  };
  if (modifiedTime) {
    options.headers = config.headers || {};
    const modifedTimeString = (new Date(modifiedTime)).toUTCString();
    options.headers['if-modified-since'] = modifedTimeString;
  }

  const { statusCode, headers, body } = await got(url, options);
  if (statusCode === 200) {
    if (headers['content-type'] === 'text/html') {
      // Serializes the parsed document
      const doc = parse5.parse(body);
      body = parse5.serialize(doc);
    }
    await fs.writeFile(cachedPath, body);
    return body;
  } else if (statusCode === 304) {
    return await fs.readFile(cachedPath);
  } else {
    throw new Error(`got http ${statusCode} while fetching ${url}`);
  }
}

export default gotCached;
