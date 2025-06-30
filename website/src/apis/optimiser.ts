import axios, { AxiosError } from 'axios';

const api = '/api/optimiser/optimise';

export interface OptimiseRequest {
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

export interface LessonSlot {
  DayIndex: number;
  EndMin: number;
  LessonKey: string | undefined;
  StartMin: number;
  classNo: string;
  coordinates: { x: number; y: number };
  day: string;
  endTime: string;
  lessonType: string;
  startTime: string;
  venue: string;
}

export interface OptimiseResponse {
  shareableLink?: string;
  Assignments?: { [lesson: string]: string };
  DaySlots?: (LessonSlot | null)[][];

  // TODO: implement type
  [key: string]: any;
}

export const sendOptimiseRequest = async (
  params: OptimiseRequest,
): Promise<OptimiseResponse | AxiosError> =>
  axios.post<OptimiseResponse>(api, params).then((resp) => resp.data);
