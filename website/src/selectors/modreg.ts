import { isEmpty, sortBy, values, isEqual } from 'lodash';
import { differenceInCalendarDays } from 'date-fns';

import { ModRegNotificationSettings, ModRegRoundKey } from 'types/reducers';
import { RegPeriodView } from 'types/views';
import { notNull } from 'types/utils';
import config, { RegPeriod, RegPeriodType } from 'config';
import { forceTimer } from 'utils/debug';

const NO_NOTIFICATIONS: RegPeriodView[] = [];

const NOTIFICATIONS_BEFORE_DAYS = 3;

export function getModRegRoundKey({ type, name }: RegPeriod): ModRegRoundKey {
  return { type, name };
}

export function isRoundDismissed(key: ModRegRoundKey, dismissed: ModRegRoundKey[]) {
  return Boolean(dismissed.find((dismissedRound) => isEqual(dismissedRound, key)));
}

export function getRounds(
  { enabled, dismissed, scheduleType }: ModRegNotificationSettings,
  schedule = config.modRegSchedule,
): RegPeriodView[] {
  if (!enabled) return NO_NOTIFICATIONS;
  const now = forceTimer() || new Date();

  // Find the nearest round of each type
  const nextRoundByType: { [type in RegPeriodType]?: RegPeriodView } = {};
  schedule[scheduleType].forEach((period) => {
    // Don't include rounds that have ended
    if (period.endDate < now) return;

    // Use the current round if it is earlier than the existing one
    const previousPeriod = nextRoundByType[period.type];
    if (!previousPeriod || previousPeriod.startDate > period.startDate) {
      const roundKey = getModRegRoundKey(period);
      nextRoundByType[period.type] = {
        ...period,
        dismissed: isRoundDismissed(roundKey, dismissed),
      };
    }
  });

  if (isEmpty(nextRoundByType)) return NO_NOTIFICATIONS;

  // Sort and return all rounds within 3 days of today
  const nextRounds = sortBy(values(nextRoundByType).filter(notNull), (period) => period.startDate);
  return nextRounds.filter(
    (round) => differenceInCalendarDays(round.startDate, now) < NOTIFICATIONS_BEFORE_DAYS,
  );
}
