// @flow
import { first, last } from 'lodash';

import type { CorsRound, CorsPeriod } from 'config';
import config from 'config';

export function roundStart(round: CorsRound): Date {
  return first(round.periods).startDate;
}

export function roundEnd(round: CorsRound): Date {
  return last(round.periods).endDate;
}

export function currentRound(now: Date = new Date()): ?CorsRound {
  return config.corsSchedule.find((round) => roundEnd(round) > now);
}

export function currentPeriod(round: CorsRound, now: Date = new Date()): ?CorsPeriod {
  return round.periods.find((period) => period.endDate > now);
}
