declare module 'ical-generator' {
  export type RepeatFreq =
    | 'YEARLY'
    | 'MONTHLY'
    | 'WEEKLY'
    | 'DAILY'
    | 'HOURLY'
    | 'MINUTELY'
    | 'SECONDLY';

  export type EventStatus = 'confirmed' | 'tentative' | 'cancelled';

  export type RepeatingEvent = {
    freq: RepeatFreq;
    count?: number;
    interval?: number;
    until?: Date;
    byDay?: string[];
    byMonth?: number[];
    byMonthDay?: number[];
    exclude?: Date[];
  };

  export type Event = {
    uid: string;
    start: Date;
    end: Date;
    repeating?: RepeatingEvent;
    summary?: string;
    description?: string;
    url?: string;
    timezone?: string;
    floating?: boolean;
    location?: string;
  };

  export type EventOption = Partial<Event>;

  const generator: Function;
  export default generator;
}
