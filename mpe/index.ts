import axios from 'axios';
import { mpe } from '../config';

const moduleTypes = ['01', '02', '03', '04'] as const;

type Choice = {
  moduleCode: string;
  rank: number;
  moduleType: typeof moduleTypes[number];
  credits: number;
};

const defaultHeaders = {
  'X-API-KEY': mpe.apiKey,
  'X-FileUpload-API': mpe.fileUploadApi,
  'X-APP-API': mpe.appApi,
};

const defaultHttpConfig = {
  headers: defaultHeaders,
};

export const getSubmissionById = async (userId: string) => {
  const endpoint = `${mpe.endpoint}/${userId}.json`;
  const resp = await axios.get(endpoint, defaultHttpConfig);
  return resp.data;
};

const isEmptyString = (str: string): boolean => str.trim() === '';
const isBetweenRangeString = (str: string, start: number, end: number): boolean => {
  if (str.length < start || str.length > end) return false;
  return true;
};

const validateChoice = (choice: Partial<Choice> | null): choice is Choice => {
  if (typeof choice !== 'object' || choice === null) {
    throw new Error('MPE choice should be an object');
  }

  if (
    typeof choice.moduleCode !== 'string' ||
    isEmptyString(choice.moduleCode) ||
    !isBetweenRangeString(choice.moduleCode, 1, 18)
  ) {
    throw new Error(
      'Please ensure that the module code is a string between 1 to 18 characters long',
    );
  }

  // Uncomment this if rank is being validated.
  // if (typeof choice.rank !== 'number' || choice.rank < 1) {
  //   errors.push('Please ensure that the module rank is an integer that is more than 0')
  // }

  if (!moduleTypes.find((type) => type === choice.moduleType)) {
    const validModuleTypesStr = moduleTypes.reduce((acc, type) => `${acc}, "${type}"`, '');
    throw new Error(`Please ensure that the module type is either ${validModuleTypesStr}`);
  }

  if (typeof choice.credits !== 'number' || choice.credits < 0) {
    throw new Error('Please ensure that the module credits is an integer that is at least zero');
  }

  return true;
};

const validatePreferences = (preferences: unknown): preferences is Choice[] => {
  if (!Array.isArray(preferences)) {
    throw new Error('MPE preferences should be an array');
  }
  preferences.forEach((choice) => validateChoice(choice));
  return true;
};

export const createSubmission = async (userId: unknown, preferences: unknown) => {
  if (typeof userId !== 'string' || isEmptyString(userId) || !isBetweenRangeString(userId, 1, 30)) {
    throw new Error('Supplied User ID needs to be between 1 to 30 characters long');
  }

  if (!validatePreferences(preferences)) {
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
};
