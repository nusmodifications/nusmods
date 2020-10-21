import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { formatDistance } from 'date-fns';

import { NotificationOptions } from 'types/reducers';
import { State } from 'types/state';

import config, { RegPeriod } from 'config';
import { dismissModregNotification } from 'actions/settings';
import { openNotification } from 'actions/app';
import { getRounds } from 'selectors/modreg';
import CloseButton from 'views/components/CloseButton';
import ExternalLink from 'views/components/ExternalLink';
import { forceTimer } from 'utils/debug';

import styles from './ModRegNotification.scss';

type Props = {
  // True only on the settings page since we don't want
  // users accidentally dismissing the preview notification
  dismissible?: boolean;
  rounds: RegPeriod[];

  dismissModregNotification: (round: RegPeriod) => void;
  openNotification: (str: string, notificationOptions: NotificationOptions) => void;
} & RouteComponentProps;

// Holy shit
const MOD_REG_URL =
  'https://myedurec.nus.edu.sg/psc/cs90prd/EMPLOYEE/SA/c/N_STUDENT_RECORDS.N_MRS_START_MD_FL.GBL?Action=U&MD=Y&GMenu=N_STUDENT_RECORDS&GComp=N_MRS_START_NAV_FL&GPage=N_MRS_START_NAV_FL&scname=N_MRS_MODULE_REG_NAV&dup=Y&';

export function notificationText(
  useLineBreaks: boolean,
  round: RegPeriod,
  now: Date,
): React.ReactNode {
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
}

export const ModRegNotificationComponent: React.FC<Props> = (props) => {
  const dismiss = (round: RegPeriod) => {
    props.dismissModregNotification(round);
    props.openNotification('Reminder snoozed until start of next round', {
      timeout: 12000,
      action: {
        text: 'Settings',
        handler: () => {
          props.history.push('/settings#modreg');
        },
      },
    });
  };

  const { rounds, dismissible } = props;
  if (!rounds.length) return null;

  return (
    <div className={styles.container}>
      {rounds.map((round) => (
        <div className={styles.notificationWrapper} key={round.type}>
          <ExternalLink href={MOD_REG_URL}>
            <div className={styles.notification}>
              {notificationText(true, round, forceTimer() || new Date())}
            </div>
          </ExternalLink>

          {!dismissible && <CloseButton className={styles.close} onClick={() => dismiss(round)} />}
        </div>
      ))}
    </div>
  );
};

const mapStateToProps = (state: State) => ({
  rounds: getRounds(state.settings.modRegNotification, config.modRegSchedule).filter(
    (round) => !round.dismissed,
  ),
});

const withStoreModRegNotification = connect(mapStateToProps, {
  dismissModregNotification,
  openNotification,
})(React.memo(ModRegNotificationComponent));

// const ModRegNotification = withRouter(withStoreModRegNotification);
const ModRegNotification = withStoreModRegNotification;
export default ModRegNotification;
