import NUSModsApi from '../apis/nusmods';
import axios from 'axios';
import type { MpePreference } from '../types/mpe';
import type { Module, ModuleCode } from '../types/modules';

// API URL to get NUS SSO Redirect Link
const SSO_PATH = 'auth/sso';
// API URL to interact with MPE submission
const MPE_PATH = 'submissions';

const mpe = axios.create({
  baseURL: 'https://nusmods.com/api/',
});

/**
 * Helper function to fetch details of a NUS module to add to MPE
 * 
 * @params  moduleCode String code of module to fetch
 * @returns array      Details of the module from the NUSMods API
 */
const fetchModuleDetails = async (moduleCode: ModuleCode) => {
  try {
    const resp = await axios.get<Module>(NUSModsApi.moduleDetailsUrl(moduleCode));
    return resp.data;
  } catch (err) {
    throw err;
  }
};

/**
 * Get link to NUS Login Page
 * 
 * @return String Link to NUS login page
 */
export const getSSOLink = async (): Promise<string> => {
  try {
    const resp = await mpe.get(SSO_PATH);
    return resp.request.responseURL;
  } catch (err) {
    throw new Error(err.response.data.message);
  }
}


/**
 * Get Students MPE preference
 * 
 * @returns preference[] Array of preferences with the following key-value pairs
 * Preference = {
 *   moduleTitle: string;
 *   moduleCode: string;
 *   moduleCredits: number;
 * }
 */
export const getMPEPreferences = async () => {
  try {
    const resp = await mpe.get(MPE_PATH);
    const rawPreferences = resp.data.preferences;

    // Fetch module details from NUSMods API
    // @ts-ignore
    const modules = await Promise.all<Module>(rawPreferences.map(p => fetchModuleDetails(p.moduleCode)));
    return modules.map(m => ({
      modulesTitle: m.title,
      moduleCode: m.moduleCode,
      moduleCredits: m.moduleCredit
    }));
  } catch (err) {
    // User has no existing MPE preferences
    if (err.response.status == 404) {
      return []
    }
    throw new Error(err.response.data.message);
  }
}

/**
 * Makes a PUT request to update students MPE preference
 * @param preferences  array of module preferences to replace current MPE preferences
 */
export const updateMPEPreference = async (preferences: MpePreference[]) => {
  try {
    const submission = preferences.map(p => ({
      moduleCode: p.moduleCode,
      moduleType: p.moduleType,
      credits: p.moduleCredits
    }));
    const res = await mpe.put(MPE_PATH, submission);
    return res.data.message;
  } catch (err) {
    throw new Error(err.response.data.message)
  }
};