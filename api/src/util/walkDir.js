import path from 'path';
import fs from 'fs-extra';

/**
 * Walks the directory, and returns all nested files of designated file name.
 * Only traverses one layer.
 * @example walkJsonDir('test', 'test.json') will find 'test/1/test.json'
 * @param {string} folderPath folder path to traverse
 * @param {string} destFileName file name to match
 */
async function walkJsonDir(folderPath, destFileName) {
  const folders = await fs.readdir(folderPath);
  const folderToJsonMap = {};
  await Promise.all(folders.map(async (folder) => {
    const filePath = path.join(folderPath, folder, destFileName);
    const fileContent = await fs.readJson(filePath).catch(() => null);
    if (fileContent) {
      folderToJsonMap[folder] = fileContent;
    }
  }));
  return folderToJsonMap;
}

/**
 * Sync version of walkJsonDir
 * @example walkJsonDir('test', 'test.json') will find 'test/1/test.json'
 * @param {string} folderPath folder path to traverse
 * @param {string} destFileName file name to match
 */
function walkJsonDirSync(folderPath, destFileName) {
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

export {
  walkJsonDir,
  walkJsonDirSync,
};
