import axios from 'axios';

const BASE_URL = 'https://api.nusmods.com/v2/2023-2024';

export const fetchModules = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/moduleList.json`);
    return response.data;
  } catch (error) {
    console.error('Error fetching modules:', error);
    return [];
  }
};
