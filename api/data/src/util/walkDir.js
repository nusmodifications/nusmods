// @flow

import path from 'path';
import fs from 'fs-extra';
import { pickBy, setWith } from 'lodash';

/**
 * Walks the directory to specified depth, and calls dataCallback with the
 * contents of all nested files of designated file name.
 * @example walkJsonDirCallback('test', 'test.json', 1, () => true, () => null)
 * will find 'test/1/test.json'
 * @param {string} folderPath folder path to traverse
 * @param {string} destFileName file name to match
 * @param {number} depth depth to search until
 * @param {number} shouldReadFile callback that should return if the file at
 * path should be read
 * @param {number} dataCallback callback that is called for every file's
 * contents
 */
export async function walkJsonDirCallback(
  folderPath: string,
  destFileName: string,
  depth: number,
  shouldReadFile: (path: string) => boolean,
  dataCallback: (data: Object, filePath: string) => void,
) {
  const folders = await fs.readdir(folderPath).catch(() => null);
  if (!folders) return null;

  return Promise.all(
    folders.map(async (folder) => {
      if (depth > 1) {
        const fPath = path.join(folderPath, folder);
        await walkJsonDirCallback(fPath, destFileName, depth - 1, shouldReadFile, dataCallback);
      } else {
        const filePath = path.join(folderPath, folder, destFileName);
        if (!shouldReadFile(filePath)) return;
        const fileContent = await fs.readJson(filePath).catch(() => null);
        if (fileContent) {
          dataCallback(fileContent, filePath);
        }
      }
    }),
  );
}

/**
 * Walks the directory, and returns all nested files of designated file name.
 * @example walkJsonDir('test', 'test.json') will find 'test/1/test.json'
 * @param {string} folderPath folder path to traverse
 * @param {string} destFileName file name to match
 * @param {number} depth depth to search until
 */
export async function walkJsonDir(folderPath: string, destFileName: string, depth: number) {
  const folders = await fs.readdir(folderPath).catch(() => null);
  if (!folders) return null;

  const folderToJsonMap = {};
  const pathFilter = () => true;
  const dataCallback = (data, filePath) => {
    const relativePath = path.dirname(path.relative(folderPath, filePath));
    const objPath = relativePath.replace(/\//g, '.');
    setWith(folderToJsonMap, objPath, data, Object);
  };
  await walkJsonDirCallback(folderPath, destFileName, depth, pathFilter, dataCallback);

  return pickBy(folderToJsonMap);
}

/**
 * Sync version of walkJsonDir.
 * Only traverses one layer.
 * @example walkJsonDir('test', 'test.json') will find 'test/1/test.json'
 * @param {string} folderPath folder path to traverse
 * @param {string} destFileName file name to match
 */
export function walkJsonDirSync(folderPath: string, destFileName: string) {
  const folders = fs.readdirSync(folderPath);
  const folderToJsonMap = {};
  folders.forEach((folder) => {
    const filePath = path.join(folderPath, folder, destFileName);
    try {
      folderToJsonMap[folder] = fs.readJsonSync(filePath);
    } catch (error) {
      // ignore errors
    }
  });
  return folderToJsonMap;
}
