declare module 'ical-generator' {
  type RepeatFreq = 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'HOURLY' | 'MINUTELY' | 'SECONDLY';

  type EventStatus = 'confirmed' | 'tenative' | 'cancelled';

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
  };
}
