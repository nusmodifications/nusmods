// @flow

export type Repeating = {
  freq: string,
  count: number,
  byDay: string,
  exclude: ?Array<Date>,
}

export type IcalEvent = {
  start: string,
  end: string,
  summary: string,
  description: string,
  url: string,
  repeating: ?Repeating,
}
