import axios from 'axios';
import { mpe } from '../config';

const defaultHeaders = {
  'X-API-KEY': mpe.apiKey,
  'X-FileUpload-API': mpe.fileUploadApi,
  'X-APP-API': mpe.appApi,
};

const defaultHttpConfig = {
  headers: defaultHeaders,
};

export const getSubmissionById = async (userId) => {
  try {
    const endpoint = `${mpe.endpoint}/${userId}.json`;
    const resp = await axios.get(endpoint, defaultHttpConfig);
    return resp.data;
  } catch (err) {
    throw err;
  }
};

export const createSubmission = async (userId, preferences) => {
  try {
    if (isEmptyString(userId) || !isBetweenRangeString(userId, 1, 30)) {
      throw new Error('Supplied User ID needs to be between 1 to 30 characters long');
    }

    const errors = validatePreferences(preferences);
    if (errors.length > 0) {
      throw new Error('MPE preferences is supplied in an invalid format');
    }

    const submission = {
      nusExchangeId: userId,
      requiredMCs: preferences.reduce((count, { credits }) => count + credits, 0),
      preferences: preferences.map(({ moduleCode, moduleType }, index) => ({
        rank: index + 1,
        moduleCode,
        moduleType,
      })),
    };

    const endpoint = `${mpe.endpoint}/${userId}.json`;
    const resp = await axios.post(endpoint, submission, defaultHttpConfig);
    return resp.data;
  } catch (err) {
    throw err;
  }
};

const moduleTypes = ['01', '02', '03', '04'];

const validatePreferences = (preferences) => {
  if (!Array.isArray(preferences)) {
    return ['MPE preferences should be an array'];
  }

  for (const choice of preferences) {
    const errors = validateChoice(choice);
    if (errors.length > 0) {
      return errors;
    }
  }

  return [];
};

const validateChoice = (choice) => {
  const errors = [];

  if (typeof choice !== 'object') {
    errors.push('MPE choice should be an object');
    return errors;
  }

  if (
    typeof choice.moduleCode !== 'string' ||
    isEmptyString(choice.moduleCode) ||
    !isBetweenRangeString(choice.moduleCode, 1, 18)
  ) {
    errors.push('Please ensure that the module code is a string between 1 to 18 characters long');
  }

  // Uncomment this if rank is being validated.
  // if (typeof choice.rank !== 'number' || choice.rank < 1) {
  //   errors.push('Please ensure that the module rank is an integer that is more than 0')
  // }

  if (!moduleTypes.find((type) => type === choice.moduleType)) {
    const validModuleTypesStr = moduleTypes.reduce((acc, type) => `${acc}, "${type}"`);
    errors.push(`Please ensure that the module type is either ${validModuleTypesStr}`);
  }

  if (typeof choice.credits !== 'number' || choice.credits < 0) {
    errors.push('Please ensure that the module credits is an integer that is at least zero');
  }

  return errors;
};

const isEmptyString = (str: String): Boolean => str.trim() === '';
const isBetweenRangeString = (str: String, start: Number, end: Number): Boolean => {
  if (str.length < start || str.length > end) return false;
  return true;
};
