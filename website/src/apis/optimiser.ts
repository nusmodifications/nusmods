import axios, { AxiosError } from 'axios';

const api = OPTIMISER_API_URL;

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
  maxConsecutiveHours: number;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const sendOptimiseRequest = async (
  params: OptimiseRequest,
): Promise<OptimiseResponse | AxiosError> =>
  axios.post<OptimiseResponse>(api, params).then((resp) => resp.data);
