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
    const moduleDetails = await axios.get(NUSModsApi.moduleDetailsUrl(moduleCode));
    return moduleDetails
}

/**
 * Get link to NUS Login Page
 * 
 * @return String Link to NUS login page
 */
export async function getSSOLink() {
    try {
        const res = await mpe.get(SSO_PATH)
        return res['data']
    } catch(err) {
        throw new Error(err.response.data.message);
        console.log(err)
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
        const formattedPreferences = []
        for (const index in res['data']['preferences']) {
            const preference = res['data']['preferences'][index]

            const moduleCode = preference["moduleCode"]
            const moduleDetails = await fetchModuleDetails(moduleCode)

            const formattedPreference = {}
            formattedPreference['moduleTitle'] = moduleDetails['data']['title']
            formattedPreference['moduleCode'] = moduleCode
            formattedPreference['moduleCredits'] = moduleDetails['data']['moduleCredit']
            formattedPreferences.push(formattedPreference)
        }
        return formattedPreferences        
    } catch(err) {
        // User has no existing MPE preferences
        if (err.response.status == 404) {
            console.log("404 Error hit")
            return []
        }
        throw new Error(err.response.data.message);
    }
}

/**
 * Makes a PUT request to update students MPE preference
 * @param preferences  array of module preferences to replace current MPE preferences
 */
export async function updateMPEPreference(preferences) {
    try {
        console.log(preferences)
       preferences.map(preference => delete preference['moduleTitle'])
        const res = await mpe.put(MPE_PATH, preferences)
        return res
    } catch(err) {
        throw new Error(err.response.data.message)
    }
}