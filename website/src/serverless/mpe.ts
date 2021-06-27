import axios from 'axios';
import { enableMpe } from '../featureFlags';
import { MpeSubmission, MpePreference, MODULE_TYPES } from '../types/mpe';
import type { Handler } from './handler';

const vfsEndpoint = process.env.NUS_VFS_MPE_ENDPOINT;
const defaultHeaders = {
  'X-API-KEY': process.env.NUS_VFS_MPE_API_KEY,
  'X-FileUpload-API': process.env.NUS_VFS_MPE_FILEUPLOAD_API,
  'X-APP-API': process.env.NUS_VFS_MPE_APP_API,
};

const vfs = axios.create({
  baseURL: vfsEndpoint,
  headers: defaultHeaders,
});

export const getSubmissionById = async (userId: string): Promise<MpeSubmission> => {
  const resp = await vfs.get<MpeSubmission>(`${userId}.json`);
  return resp.data;
};

export const createSubmission = async (userId: unknown, data: unknown): Promise<unknown> => {
  if (typeof userId !== 'string' || isEmptyString(userId) || !isBetweenRangeString(userId, 1, 30)) {
    throw new Error('User ID needs to be between 1 to 30 characters long');
  }

  const submission = convertToMpeSubmission(data);
  if (!submission) {
    throw new Error('Data argument does not conform to the MpeSubmission type');
  }

  if (submission.intendedMCs < 0) {
    throw new Error('Intended MCs must be at least 0 and above');
  }

  if (!validatePreferences(submission.preferences)) {
    throw new Error('Submission preferences failed to meet validation requirements');
  }

  const validatedSubmission: MpeSubmission = {
    nusExchangeId: userId,
    intendedMCs: submission.intendedMCs,
    preferences: submission.preferences.map(({ moduleCode, moduleType }, index) => ({
      rank: index + 1,
      moduleCode,
      moduleType,
    })),
  };

  const resp = await vfs.post(`${userId}.json`, validatedSubmission);
  return resp.data;
};

const isEmptyString = (str: string): boolean => str.trim() === '';

const isBetweenRangeString = (str: string, start: number, end: number): boolean => {
  if (str.length < start || str.length > end) return false;
  return true;
};

// Refactor all code from here on when TS supports the `in` operator for the
// narrowing of unknown types.
// https://github.com/microsoft/TypeScript/issues/25720#issuecomment-533438205
const isUnknownObject = (x: unknown): x is { [key in PropertyKey]: unknown } =>
  x !== null && typeof x === 'object';

const isMpePreference = (preference: unknown): boolean => {
  if (
    isUnknownObject(preference) &&
    typeof preference.moduleCode === 'string' &&
    Object.keys(MODULE_TYPES).find((type) => type === preference.moduleType)
  ) {
    return true;
  }
  return false;
};

const isMpeSubmission = (submission: unknown): boolean => {
  if (
    isUnknownObject(submission) &&
    typeof submission.intendedMCs === 'number' &&
    Array.isArray(submission.preferences) &&
    !submission.preferences.find((preference) => !isMpePreference(preference))
  ) {
    return true;
  }
  return false;
};

const convertToMpeSubmission = (submission: unknown): MpeSubmission | undefined => {
  if (isMpeSubmission(submission)) {
    return submission as MpeSubmission;
  }
  return undefined;
};

const validatePreferences = (preferences: MpePreference[]): boolean =>
  preferences.every(
    (preference) =>
      !isEmptyString(preference.moduleCode) && isBetweenRangeString(preference.moduleCode, 1, 18),
  );

export const featureFlagEnablerMiddleware = (next: Handler): Handler => async (
  req,
  res,
): Promise<void> => {
  if (!enableMpe) {
    res.status(404).end();
    return;
  }
  next(req, res);
};
