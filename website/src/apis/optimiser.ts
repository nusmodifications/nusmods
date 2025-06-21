import axios from 'axios';

const api = '/api/optimiser/optimise';

interface OptimiseRequest {
  modules: string[];
  acadYear: string;
  acadSem: number;
  freeDays: string[];
  earliestTime: string;
  latestTime: string;
  recordings: string[];
  lunchStart: string;
  lunchEnd: string;
}

interface OptimiseResponse {
  shareableLink?: string;
  Assignments?: any;
  DaySlots?: any[][];
  [key: string]: any;
}

export const sendOptimiseRequest = async (
  modules: string[],
  acadYear: string,
  acadSem: number,
  freeDays: string[],
  earliestTime: string,
  latestTime: string,
  recordings: string[],
  lunchStart: string,
  lunchEnd: string,
): Promise<OptimiseResponse | null> => {
  const requestData: OptimiseRequest = {
    modules,
    acadYear,
    acadSem,
    freeDays,
    earliestTime,
    latestTime,
    recordings,
    lunchStart,
    lunchEnd,
  };

  return axios.post<OptimiseResponse>(api, requestData)
    .then(resp => resp.data)
    .catch(err => {
      console.error(err);
      return null;
    });
};