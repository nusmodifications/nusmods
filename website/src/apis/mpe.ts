import axios from 'axios';
import { useLayoutEffect } from 'react';
import getLocalStorage from 'storage/localStorage';
import { Location, History } from 'history';
import NUSModsApi from './nusmods';
import type { MpePreference } from '../types/mpe';
import type { Module, ModuleCode } from '../types/modules';

const SSO_PATH = '/auth/sso';
const MPE_PATH = '/mpe/submissions';
const TOKEN_STORAGE_KEY = 'nus-auth-token';
const TOKEN_URL_QUERY = 'token';

export const ERR_SESSION_EXPIRED = new Error('User session has expired, please login again');

const storage = getLocalStorage();

const getToken = (): string | null => storage.getItem(TOKEN_STORAGE_KEY);

const setToken = (token: string): void => storage.setItem(TOKEN_STORAGE_KEY, token);

const removeToken = (): void => storage.removeItem(TOKEN_STORAGE_KEY);

const mpe = axios.create({
  baseURL: 'https://nusmods.com/api/nus',
});

mpe.interceptors.request.use((config) => {
  const updatedConfig = { ...config };
  updatedConfig.headers.Authorization = getToken();
  return updatedConfig;
});

mpe.interceptors.response.use(
  (resp) => resp,
  (err) => {
    if (err?.response?.status === 401) {
      removeToken();
      return Promise.reject(ERR_SESSION_EXPIRED);
    }
    return Promise.reject(err);
  },
);

export const useProcessLogin = (location: Location, history: History): boolean => {
  const params = new URLSearchParams(location.search);
  const token = params.get(TOKEN_URL_QUERY);
  useLayoutEffect(() => {
    if (token !== null) {
      setToken(token);
      params.delete(TOKEN_URL_QUERY);
      history.replace({
        search: params.toString(),
      });
    }
  });
  return getToken() !== null;
};

export const fetchModuleDetails = async (moduleCode: ModuleCode): Promise<Module> => {
  const resp = await axios.get<Module>(NUSModsApi.moduleDetailsUrl(moduleCode));
  return resp.data;
};

export const getSSOLink = async (): Promise<string> => {
  const resp = await mpe.get(SSO_PATH);
  return resp.request.responseURL;
};

export const getMpePreferences = async (): Promise<MpePreference[]> => {
  try {
    const resp = await mpe.get(MPE_PATH);
    const rawPreferences = resp.data.preferences;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const moduleTypes = rawPreferences.map((p) => ({ type: p.moduleType }));
    const modules = await Promise.all<Module>(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      rawPreferences.map((p) => fetchModuleDetails(p.moduleCode)),
    );
    return modules.map<MpePreference>((m, index) => ({
      moduleTitle: m.title,
      moduleCode: m.moduleCode,
      moduleType: moduleTypes[index],
      moduleCredits: parseInt(m.moduleCredit, 10),
    }));
  } catch (err) {
    // User has no existing MPE preferences
    if (err?.response?.status === 404) {
      return [];
    }
    throw err;
  }
};

export const updateMpePreferences = async (preferences: MpePreference[]): Promise<string> => {
  const submission = preferences.map((p) => ({
    moduleCode: p.moduleCode,
    moduleType: p.moduleType.type,
    credits: p.moduleCredits,
  }));
  const resp = await mpe.put(MPE_PATH, submission);
  return resp.data.message;
};
