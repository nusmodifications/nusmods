import { FC, memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, NavLink } from 'react-router-dom';
import { formatDistance } from 'date-fns';

import type { State } from 'types/state';

import config, { RegPeriod, RegPeriodType } from 'config';
import { dismissModregNotification } from 'actions/settings';
import { openNotification } from 'actions/app';
import { getRounds } from 'selectors/modreg';
import CloseButton from 'views/components/CloseButton';
import ExternalLink from 'views/components/ExternalLink';
import { forceTimer } from 'utils/debug';

import styles from './ModRegNotification.scss';

// Holy shit
const MOD_REG_URL =
  'https://myedurec.nus.edu.sg/psc/cs90prd/EMPLOYEE/SA/c/N_STUDENT_RECORDS.N_MRS_START_MD_FL.GBL?Action=U&MD=Y&GMenu=N_STUDENT_RECORDS&GComp=N_MRS_START_NAV_FL&GPage=N_MRS_START_NAV_FL&scname=N_MRS_MODULE_REG_NAV&dup=Y&';

const NotificationText: FC<{
  useLineBreaks: boolean;
  round: RegPeriod;
  now: Date;
}> = ({ useLineBreaks, round, now }) => {
  const isRoundOpen = now >= round.startDate;
  const timeFromNow = formatDistance(now, isRoundOpen ? round.endDate : round.startDate, {
    includeSeconds: true,
  });

  return (
    <>
      {isRoundOpen ? 'Current' : 'Next'} <strong>{round.type}</strong>{' '}
      {round.name ? `(Round ${round.name})` : ''}: {useLineBreaks && <br />}
      {isRoundOpen ? ' till' : ' at'} <strong>{isRoundOpen ? round.end : round.start}</strong>
      {useLineBreaks && <br />} ({timeFromNow} from now)
    </>
  );
};

const NotificationLink: FC<{
  roundType: RegPeriodType;
  children: React.ReactNode;
}> = ({ roundType, children }) =>
  roundType === 'Course Planning Exercise (CPEx)' ? (
    <NavLink to="/cpex">{children}</NavLink>
  ) : (
    <ExternalLink href={MOD_REG_URL}>{children}</ExternalLink>
  );

const ModRegNotification: FC<{
  // True only on the settings page since we don't want
  // users accidentally dismissing the preview notification
  dismissible?: boolean;
}> = ({ dismissible }) => {
  const rounds = useSelector(({ settings }: State) =>
    getRounds(settings.modRegNotification, config.modRegSchedule).filter(
      (round) => !round.dismissed,
    ),
  );
  const dispatch = useDispatch();

  const history = useHistory();

  const dismiss = useCallback(
    (round: RegPeriod) => {
      dispatch(dismissModregNotification(round));
      dispatch(
        openNotification('Reminder snoozed until start of next round', {
          timeout: 12000,
          action: {
            text: 'Settings',
            handler: () => {
              history.push('/settings#modreg');
            },
          },
        }),
      );
    },
    [dispatch, history],
  );

  if (!rounds.length) return null;

  return (
    <div className={styles.container}>
      {rounds.map((round) => (
        <div className={styles.notificationWrapper} key={round.type}>
          <NotificationLink roundType={round.type}>
            <div className={styles.notification}>
              <NotificationText useLineBreaks round={round} now={forceTimer() || new Date()} />
            </div>
          </NotificationLink>

          {!dismissible && <CloseButton className={styles.close} onClick={() => dismiss(round)} />}
        </div>
      ))}
    </div>
  );
};

export default memo(ModRegNotification);
