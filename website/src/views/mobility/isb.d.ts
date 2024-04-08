/* eslint-disable camelcase */

interface ShuttleServiceResult {
  TimeStamp: string;
  hints: string[];
  name: string;
  shuttles: Shuttle[];
  caption: string;
}

type NUSShuttle = {
  passengers: string;
  name: string;
  _etas?: Eta[];
  nextArrivalTime: string;
  routeid: number;
  // ends with -S or -E if its a terminus
  busstopcode: string;
  arrivalTime_veh_plate: string;
  arrivalTime: string;
  nextPassengers: string;
  nextArrivalTime_veh_plate: string;
};

type PublicShuttleAPI = {
  name: string;
  busstopcode: string;
  arrivalTime: string;
  nextArrivalTime: string;
};

interface PublicShuttle extends PublicShuttleAPI {
  number: number;
}

type Shuttle = NUSShuttle | PublicShuttleAPI;

interface Eta {
  plate: string;
  px: string;
  ts: string;
  jobid: number;
  eta: number;
  eta_s: number;
}

interface ISBStop {
  caption: string;
  name: string;
  LongName: string;
  ShortName: string;
  latitude: number;
  longitude: number;
  shuttles: (
    | {
        name: string;
        routeid: number;
      }
    | {
        name: string;
        routeid?: undefined;
      }
  )[];
  leftLabel?: boolean;
  collapse?: number;
  collapseBehavior?: string;
  collapsePair?: string;
  collapseLabel?: undefined;
  opposite: string | null;
}

interface ScheduleBlock {
  from: string;
  to: string;
  interval: number[];
}

interface ISBService {
  id: string;
  name: string;
  color: string;
  color2: string;
  color2dark: string;
  stops: string[];
  notableStops: string[];
  schedule: {
    term: ScheduleBlock[][];
    vacation: ScheduleBlock[][];
  };
}

type ServiceStatus =
  | {
      id: string;
      running: true;
      currentBlock: ScheduleBlock;
    }
  | {
      id: string;
      running: false;
      runningThisPeriod: true;
      nextDay: number;
      nextTime: string;
    }
  | {
      id: string;
      running: false;
      runningThisPeriod: false;
    };
