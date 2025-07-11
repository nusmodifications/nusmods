import { memo, useState } from 'react';
import classnames from 'classnames';
import { Info } from 'react-feather';

import { toggleBetaTesting } from 'actions/settings';
import CloseButton from 'views/components/CloseButton';
import { useSelector, useDispatch } from 'react-redux';
import { State } from 'types/state';
import styles from './BetaAnnouncement.scss';

const BetaAnnouncement = memo(() => {
  const dispatch = useDispatch();
  const beta = useSelector(({ settings }: State) => settings.beta);
  const [isVisible, setIsVisible] = useState(true);

  // Don't show if user is already a beta tester or manually dismissed
  if (beta || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div className={classnames('alert alert-info no-export', styles.announcement)}>
      <Info className={styles.backgroundIcon} />

      <div className={classnames(styles.body, styles.wrapButtons)}>
        <h3>Timetable Optimiser is now in BETA!</h3>
        <p className={styles.bodyElement}>
          Turn on NUSMods BETA to try out the new timetable optimiser to help you find your optimal
          timetable based on your preferences.
        </p>
        <p className={styles.bodyElement}>Share your feedback to help us make it even better!</p>
        <div className={styles.Betabutton}>
          <button
            className="btn btn-info"
            type="button"
            onClick={() => dispatch(toggleBetaTesting())}
          >
            Turn on BETA
          </button>
        </div>
      </div>

      <div className={styles.buttons}>
        <CloseButton onClick={handleDismiss} />
      </div>
    </div>
  );
});

export default BetaAnnouncement;
