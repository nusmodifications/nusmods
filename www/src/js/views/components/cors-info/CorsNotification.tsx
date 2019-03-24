import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { capitalize } from 'lodash';

import { NotificationOptions } from 'types/reducers';

import config, { CorsRound } from 'config';
import { dismissCorsNotification } from 'actions/settings';
import { openNotification } from 'actions/app';
import { roundStart, currentPeriod, currentRound } from 'utils/cors';
import { forceCorsRound } from 'utils/debug';
import CloseButton from 'views/components/CloseButton';
import ExternalLink from 'views/components/ExternalLink';
import { State } from 'types/state';

import styles from './CorsNotification.scss';

type Props = {
  // True only in the preview in the settings page since we don't want
  // users accidentally dismissing that
  hideCloseButton?: boolean;
  enabled: boolean;
  dismissedRounds: string[];

  dismissCorsNotification: (str: string) => void;
  openNotification: (str: string, notificationOptions: NotificationOptions) => void;
} & RouteComponentProps;

const NOW = new Date();

export function corsNotificationText(
  useLineBreaks: boolean,
  round: CorsRound | null = currentRound(),
  now: Date = new Date(),
): React.ReactNode {
  if (!round) return null;
  const period = currentPeriod(round, now);
  if (!period) return null;
  const isRoundOpen = now >= period.startDate;

  return (
    <>
      {isRoundOpen ? 'Current' : 'Next'} CORS round:{' '}
      <strong>
        {round.round} ({capitalize(period.type)})
      </strong>
      {isRoundOpen ? ' till' : ' at'} {useLineBreaks && <br />}
      <strong>{isRoundOpen ? period.end : period.start}</strong>
    </>
  );
}

function currentTime() {
  const debugRound = forceCorsRound();

  // For manual testing - add round | null | undefined=1A (or other round names) to trigger the notification
  if (debugRound) {
    const round = config.corsSchedule.find((r) => r.round === debugRound);
    if (round) return roundStart(round);
  }

  return NOW;
}

export class CorsNotificationComponent extends React.PureComponent<Props> {
  dismiss = (round: string) => {
    this.props.dismissCorsNotification(round);
    this.props.openNotification('Reminder snoozed until start of next round', {
      timeout: 12000,
      action: {
        text: 'Settings',
        handler: () => {
          this.props.history.push('/settings#cors');
        },
      },
    });
  };

  render() {
    const { enabled, dismissedRounds, hideCloseButton } = this.props;

    // User has disabled CORS notification globally
    if (!enabled) return null;

    const round = currentRound(currentTime());

    // CORS bidding is over - don't show anything
    if (!round) return null;

    // User has dismissed this round of CORS notifications
    if (dismissedRounds.includes(round.round)) return null;

    return (
      <div className={styles.wrapper}>
        <ExternalLink href="https://myaces.nus.edu.sg/cors/StudentLogin">
          <div className={styles.notification}>
            {corsNotificationText(true, round, currentTime())}
          </div>
        </ExternalLink>

        {!hideCloseButton && (
          <CloseButton className={styles.close} onClick={() => this.dismiss(round.round)} />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  enabled: state.settings.corsNotification.enabled,
  dismissedRounds: state.settings.corsNotification.dismissed,
});

const withStoreCorsNotification = connect(
  mapStateToProps,
  {
    dismissCorsNotification,
    openNotification,
  },
)(CorsNotificationComponent);
const CorsNotification = withRouter(withStoreCorsNotification);
export default CorsNotification;
