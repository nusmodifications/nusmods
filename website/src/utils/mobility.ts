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
