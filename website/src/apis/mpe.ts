import axios from 'axios';
import getLocalStorage from 'storage/localStorage';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Location, History } from 'history';
import { produce } from 'immer';
import NUSModsApi from './nusmods';
import { MpePreference } from '../types/mpe';
import type { Module, ModuleCode } from '../types/modules';
import { NUS_AUTH_TOKEN } from '../storage/keys';

type MpePreferencesResponse = {
  nusExchangeId: string;
  preferences: Array<{
    rank: number;
    moduleCode: ModuleCode;
    moduleType: MpePreference['moduleType'];
  }>;
};

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

export const fetchModuleDetails = (moduleCode: ModuleCode): Promise<Module> =>
  axios.get<Module>(NUSModsApi.moduleDetailsUrl(moduleCode)).then((resp) => resp.data);

export const getSSOLink = (): Promise<string> =>
  mpe
    .get(SSO_PATH, {
      params: { callback: window.location.href },
    })
    .then((resp) => resp.data);

export const getMpePreferences = (): Promise<MpePreference[]> => {
  let responsePreferences: MpePreferencesResponse['preferences'] = [];
  return mpe
    .get<MpePreferencesResponse>(MPE_PATH)
    .then((resp) => {
      responsePreferences = resp.data.preferences;
      return Promise.all<Module>(responsePreferences.map((p) => fetchModuleDetails(p.moduleCode)));
    })
    .then((modules) =>
      modules.map<MpePreference>((m, index) => ({
        moduleTitle: m.title,
        moduleCode: m.moduleCode,
        moduleType: responsePreferences[index].moduleType,
        moduleCredits: parseInt(m.moduleCredit, 10),
      })),
    )
    .catch((err) => {
      // User has no existing MPE preferences
      if (err?.response?.status === 404) {
        return [];
      }
      throw err;
    });
};

export const updateMpePreferences = (preferences: MpePreference[]): Promise<string> => {
  const submission = preferences.map((p) => ({
    moduleCode: p.moduleCode,
    moduleType: p.moduleType,
    credits: p.moduleCredits,
  }));
  return mpe.put(MPE_PATH, submission).then((resp) => resp.data.message);
};
