import axios from 'axios';
import getLocalStorage from 'storage/localStorage';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Location, History } from 'history';
import { produce } from 'immer';
import NUSModsApi from './nusmods';
import { MpeSubmission, MpeModule } from '../types/mpe';
import { NUS_AUTH_TOKEN } from '../storage/keys';

export class MpeSessionExpiredError extends Error {}

const SSO_PATH = '/auth/sso';
const MPE_PATH = '/mpe/submissions';
const TOKEN_URL_QUERY = 'token';

const storage = getLocalStorage();

const getToken = (): string | null => storage.getItem(NUS_AUTH_TOKEN);

const setToken = (token: string): void => storage.setItem(NUS_AUTH_TOKEN, token);

const removeToken = (): void => storage.removeItem(NUS_AUTH_TOKEN);

const mpe = axios.create({
  baseURL: '/api/nus',
});

mpe.interceptors.request.use(
  produce((draft) => {
    draft.headers.Authorization = getToken();
  }),
);

mpe.interceptors.response.use(
  (resp) => resp,
  (err) => {
    if (err?.response?.status === 401) {
      removeToken();
      return Promise.reject(new MpeSessionExpiredError());
    }
    return Promise.reject(err);
  },
);

export const getLoginState = (location: Location, history: History): boolean => {
  const params = new URLSearchParams(location.search);
  const token = params.get(TOKEN_URL_QUERY);
  if (token !== null) {
    setToken(token);
    params.delete(TOKEN_URL_QUERY);
    history.replace({
      search: params.toString(),
    });
  }
  return getToken() !== null;
};

export const fetchMpeModuleList = (): Promise<MpeModule[]> =>
  // TODO: Check with NUS if we should use MPE_AY here instead
  axios.get<MpeModule[]>(NUSModsApi.mpeModuleListUrl()).then((resp) => resp.data);

export const getSSOLink = (): Promise<string> =>
  mpe
    .get(SSO_PATH, {
      params: { callback: window.location.href },
    })
    .then((resp) => resp.data);

// TODO: Replace data fetched from MPE server with latest data from MPE module list
export const getMpeSubmission = (): Promise<MpeSubmission> =>
  mpe.get<MpeSubmission>(MPE_PATH).then((resp) => resp.data);

export const updateMpeSubmission = (submission: MpeSubmission): Promise<void> => {
  if (submission.intendedMCs < 0) {
    throw new Error('Intended amount of MCs to take cannot be less than 0');
  }
  return mpe.put(MPE_PATH, submission);
};
