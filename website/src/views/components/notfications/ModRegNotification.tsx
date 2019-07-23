import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';

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
  // True only in the preview in the settings page since we don't want
  // users accidentally dismissing that
  hideCloseButton?: boolean;
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

  return (
    <>
      {isRoundOpen ? 'Current' : 'Next'} <strong>{round.type}</strong>{' '}
      {round.name ? `(Round ${round.name})` : ''}: {useLineBreaks && <br />}
      {isRoundOpen ? ' till' : ' at'} <strong>{isRoundOpen ? round.end : round.start}</strong>
    </>
  );
}

export class ModRegNotificationComponent extends React.PureComponent<Props> {
  dismiss = (round: RegPeriod) => {
    this.props.dismissModregNotification(round);
    this.props.openNotification('Reminder snoozed until start of next round', {
      timeout: 12000,
      action: {
        text: 'Settings',
        handler: () => {
          this.props.history.push('/settings#modreg');
        },
      },
    });
  };

  render() {
    const { rounds, hideCloseButton } = this.props;
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

            {!hideCloseButton && (
              <CloseButton className={styles.close} onClick={() => this.dismiss(round)} />
            )}
          </div>
        ))}
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  rounds: getRounds(state.settings.modRegNotification, config.modRegSchedule).filter(
    (round) => !round.dismissed,
  ),
});

const withStoreModRegNotification = connect(
  mapStateToProps,
  {
    dismissModregNotification,
    openNotification,
  },
)(ModRegNotificationComponent);

const ModRegNotification = withRouter(withStoreModRegNotification);
export default ModRegNotification;
