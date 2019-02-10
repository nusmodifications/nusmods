import { first, last } from 'lodash';

import config, { CorsRound, CorsPeriod } from 'config';

export function roundStart(round: CorsRound): Date {
  return first(round.periods)!.startDate;
}

export function roundEnd(round: CorsRound): Date {
  return last(round.periods)!.endDate;
}

export function currentRound(now: Date = new Date()): CorsRound | null {
  return config.corsSchedule.find((round) => roundEnd(round) > now) || null;
}

export function currentPeriod(
  round: CorsRound,
  now: Date = new Date(),
): CorsPeriod | null | undefined {
  return round.periods.find((period) => period.endDate > now);
}
