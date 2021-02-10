import NUSModsApi from '../apis/nusmods';
const axios = require('axios');

// API URL to get NUS SSO Redirect Link
const SSO_PATH = "auth/sso"
// API URL to interact with MPE submission
const MPE_PATH = "submissions"

const mpe = axios.create({
    baseURL: 'https://nusmods.com/api/',
  })
  

/**
 * Helper function to fetch details of a NUS module to add to MPE
 * 
 * @params  moduleCode String code of module to fetch
 * @returns array      Details of the module from the NUSMods API
 */
async function fetchModuleDetails(moduleCode) {
    return await axios.get(NUSModsApi.moduleDetailsUrl(moduleCode));
}

/**
 * Get link to NUS Login Page
 * 
 * @return String Link to NUS login page
 */
export async function getSSOLink() {
    try {
        const res = await mpe.get(SSO_PATH)
        return res.request.responseURL
    } catch(err) {
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
export async function getMPEPreference() {
    try {
        const res = await mpe.get(MPE_PATH)
        const rawPreferences = res.data.preferences

        // Fetch module details from NUSMods API
        const modules = await Promise.all(rawPreferences.map(p => fetchModuleDetails(p.moduleCode)))
        return modules.map(m => ({
            modulesTitle:  m.data.title,
            moduleCode:    m.data.moduleCode,
            moduleCredits: m.data.moduleCredit
        }))    
    } catch(err) {
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
export async function updateMPEPreference(rawPreferences) {
    try {
        const preferences = rawPreferences.map(p => ({
            moduleCode: p.moduleCode,
            moduleType: p.moduleType,
            credits: p.credits
        }))
        const res = await mpe.put(MPE_PATH, preferences)
        return res.data.message
    } catch(err) {
        throw new Error(err.response.data.message)
    }
}