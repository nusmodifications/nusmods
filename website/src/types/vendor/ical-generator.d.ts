declare module 'ical-generator' {
  // Partial types - see https://github.com/sebbo2002/ical-generator/tree/0.2.9 for
  // complete types

  export type Timezone = string; // TZ database name

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
    uid: string | number;
    start: Date;
    end: Date;
    repeating?: RepeatingEvent;
    summary?: string;
    description?: string;
    url?: string;
    location?: string;
    // Timezone and floating are mutually exclusive options. If neither are set, the
    // date will be output in UTC format
    timezone?: Timezone;
    floating?: boolean;
  };

  export type EventOption = Partial<Event>;

  export class Calendar {
    toString(): string;

    // Very incomplete - we don't use any of the setters, so these are untyped
  }

  export type ProdId = {
    company: string;
    product: string;
    language?: string; // Defaults to EN
  };

  export type Init = {
    domain?: string;
    prodId?: string | ProdId;
    name?: string;
    timezone?: Timezone;
    events?: EventOption[];
  };

  const generator: (options?: Init) => Calendar;
  export default generator;
}
