// @flow

export type Repeating = {
  freq: string,
  count: number,
  byDay: string[],
  exclude: ?Array<Date>,
}

export type IcalEvent = {
  start: Date,
  end: Date,
  summary: string,
  description: string,
  url: string,
  repeating?: Repeating,
}
