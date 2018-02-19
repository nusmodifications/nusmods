import path from 'path';
import R from 'ramda';

const fs = jest.genMockFromModule('fs-extra');

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles = {};
let mockFilesMeta = {};
fs.setMock = (mockFileSystem, mockFilesSystemMeta) => {
  mockFiles = mockFileSystem;
  mockFilesMeta = mockFilesSystemMeta;
};

fs.readFileSync = (filePath) => mockFiles[filePath];

fs.readFile = async (filePath) => fs.readFileSync(filePath);

// A custom version of `readdirSync` that reads from the special mocked out
// file list set via setMock
fs.readdirSync = (directoryPath) => {
  const pathArr = directoryPath.split(path.sep);
  return Object.keys(R.path(pathArr, mockFiles)) || [];
};

// A custom version of `readdir` that reads from the special mocked out
// file list set via setMock
fs.readdir = async (directoryPath) => fs.readdirSync(directoryPath);

// A custom version of `readJson` that reads from the special mocked out
// file list set via setMock

/**
 * A custom version of `readJson` that reads from the mocked out file system.
 * Reads json from string, error otherwise.
 */
fs.readJson = async (directoryPath) => {
  const pathArr = directoryPath.split(path.sep);
  try {
    return JSON.parse(R.path(pathArr, mockFiles));
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * A custom version of `readJsonSync` that reads from the mocked out file system.
 * Reads json from string, error otherwise.
 */
fs.readJsonSync = (directoryPath) => {
  const pathArr = directoryPath.split(path.sep);
  return JSON.parse(R.path(pathArr, mockFiles));
};

/**
 * Mocks and fakes meta data for the file
 */
fs.stat = async (filePath) => {
  const meta = mockFilesMeta[filePath];
  if (!meta) {
    throw new Error('No such file');
  }
  return meta;
};

module.exports = fs;
