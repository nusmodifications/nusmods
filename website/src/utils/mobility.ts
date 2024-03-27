import isbServicesJSON from '../data/isb-services.json';

const isbServices = isbServicesJSON;

export const timeIsBefore = (a: Date, b: string) => {
  const parse = (x: string) => parseInt(x, 10);
  const ta = new Date(0, 0, 0, a.getHours(), a.getMinutes());
  const tb = new Date(0, 0, 0, ...b.split(':').map(parse));
  return ta < tb;
};

export const timeIsAfter = (a: Date, b: string) => !timeIsBefore(a, b);

export const isWithinBlock = (time: Date, block: ScheduleBlock) => {
  const { from, to } = block;
  return timeIsBefore(time, to) && timeIsAfter(time, from);
};

export const getServiceStatus = (period: 'term' | 'vacation' = 'term') => {
  const time = new Date();
  // used to debug:
  // time.setHours(time.getHours() - 2);

  const serviceStatuses: ServiceStatus[] = isbServices.map((service) => {
    const todaySchedule = service.schedule[period][time.getDay()];
    const currentBlock = todaySchedule.find((t) => isWithinBlock(time, t));
    if (currentBlock) {
      return {
        id: service.id,
        running: true,
        currentBlock,
      };
    }

    let nextBlock;
    let i = -1;
    while (!nextBlock && i < 7) {
      i += 1;
      // if this day has schedule
      if (service.schedule[period][(time.getDay() + i) % 7].length > 0) {
        if (i === 0) {
          // today
          nextBlock = todaySchedule.find((t) => timeIsBefore(time, t.from));
        } else [nextBlock] = service.schedule[period][(time.getDay() + i) % 7];
      }
    }

    console.log(nextBlock, i, 'service:', service.id);
    if (nextBlock) {
      return {
        id: service.id,
        running: false,
        runningThisPeriod: true,
        nextDay: (time.getDay() + i) % 7,
        nextTime: nextBlock.from,
      };
    }
    return {
      id: service.id,
      running: false,
      runningThisPeriod: false,
    };
  });
  return serviceStatuses;
};

export const getArrivalTime = (eta: number) => {
  const date = new Date();
  date.setSeconds(date.getSeconds() + eta);
  return date;
};

export const getShownArrivalTime = (eta: number, forceTime = false) => {
  const date = getArrivalTime(eta);
  if (!forceTime && eta < 60 * 60) {
    if (eta < 60) return 'Arriving';
    return `${Math.floor(eta / 60)} mins`;
  }
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    // time in SGT
    timeZone: 'Asia/Singapore',
  });
};

export const getDepartAndArriveTiming = (timings: NUSShuttle[] | string = [], isEnd: boolean) => {
  if (typeof timings === 'string') return { departTiming: undefined, arriveTiming: undefined };

  if (isEnd) {
    const departTiming = timings.find((t) => t.busstopcode.endsWith('-S'));
    const arriveTiming = timings.find((t) => t.busstopcode.endsWith('-E')) || timings[0];
    return { departTiming, arriveTiming };
  }
  return { departTiming: timings[0], arriveTiming: undefined };
};

export const getRouteSegments = (stops: string[], color: string) => {
  const routes = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const thisStop = stops[i];
    const nextStop = stops[i + 1];
    routes.push({
      start: thisStop,
      end: nextStop,
      color,
    });
  }

  return routes;
};

const btcStops = ['CG', 'OTH', 'BG-MRT'];

export const segmentsToClasses = (segments: { start: string; end: string; color: string }[]) =>
  segments.map(({ start, end, color }) => {
    const classes = [];

    const relationClassname = `${start}__${end}`;
    const svgPrefixes = ['KRC_svg__KRC'];
    if (btcStops.includes(start) || btcStops.includes(end)) {
      svgPrefixes.push('BTC_svg__BTC');
    }

    classes.push(`.${svgPrefixes[0]} .${svgPrefixes[0].slice(0, -3)}${relationClassname}`);
    if (svgPrefixes.length > 1) {
      classes.push(`.${svgPrefixes[1]} .${svgPrefixes[1].slice(0, -3)}${relationClassname}`);
    }

    return { classes, color };
  });
