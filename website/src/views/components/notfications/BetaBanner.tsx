import { memo, useCallback, useState } from 'react';
import classnames from 'classnames';
import { Info } from 'react-feather';
import { useHistory } from 'react-router-dom';

import CloseButton from 'views/components/CloseButton';
import { useSelector } from 'react-redux';
import { State } from 'types/state';
import styles from './BetaBanner.scss';
import { BETA_BANNER } from 'storage/keys';
import storage from 'storage';

const key = BETA_BANNER;

const BetaBanner = memo(() => {
  const history = useHistory();
  const beta = useSelector(({ settings }: State) => settings.beta);
  const [isOpen, setIsOpen] = useState(() => {
    if (beta) return false;
    if (key) return !storage.getItem(key);
    return true;
  });

  
  const dismiss = useCallback(() => {
    if (key) storage.setItem(key, true);
    setIsOpen(false);
  }, []);
  
  if (!isOpen) {
    return null;
  }

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
            onClick={() => history.push('/settings#beta')}
          >
            Turn on BETA
          </button>
        </div>
      </div>

      <div className={styles.buttons}>
        <CloseButton onClick={dismiss} />
      </div>
    </div>
  );
});

export default BetaBanner;
