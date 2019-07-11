import { first, last } from 'lodash';

import config, { ModRegRound, RegPeriod } from 'config';

export function roundStart(round: ModRegRound): Date {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return first(round.periods)!.startDate;
}

export function roundEnd(round: ModRegRound): Date {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return last(round.periods)!.endDate;
}

export function currentRound(now: Date = new Date()): ModRegRound | null {
  return config.corsSchedule.find((round) => roundEnd(round) > now) || null;
}

export function currentPeriod(
  round: ModRegRound,
  now: Date = new Date(),
): RegPeriod | null | undefined {
  return round.periods.find((period) => period.endDate > now);
}
