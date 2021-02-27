import { memo, useState, useCallback } from 'react';
import classnames from 'classnames';
import { Target } from 'react-feather';
import { Link } from 'react-router-dom';

import { enableMpe } from 'featureFlags';
import storage from 'storage';
import { announcementKey } from 'storage/keys';
import CloseButton from 'views/components/CloseButton';
import styles from './Announcements.scss';

/**
 * If false, hides announcement.
 */
const enableAnnouncements = enableMpe;

/**
 * Unique key for the current announcement. If the announcement is not
 * dismissible, set the key to null. Otherwise, set it to a string.
 *
 * Previous keys:
 * - 'ay202021-new-data' - AY2020/21 data is available
 * - 'ay201920-new-data' - AY2019/20 data is available
 * - 'nusmods-is-official' - NUSMods switch to official APIs
 * - 'nusmods-r-announcement' - NUSMods R announcement message
 * - 'ay201819-new-data' - AY2018/19 data is available
 * - 'ay201819-s2-new-data' - S2 data available
 */
const key = announcementKey(null);

const Announcements = memo(() => {
  const [isOpen, setIsOpen] = useState(() => {
    if (!enableAnnouncements) return false;
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
    <div
      className={classnames(
        'alert alert-primary no-export',
        styles.announcement,
        styles.wrapButtons,
      )}
    >
      <Target className={styles.backgroundIcon} />

      <div className={styles.body}>
        <h3>Module Planning Exercise for AY2021/22 Semester 1 Now Open!</h3>
        <p className={styles.bodyElement}>
          From 1st-14th March, use our MPE form to pick modules you're thinking of reading in
          Semester 1. While this isn't ModReg, your participation in MPE will help NUS to plan
          resources and module timetables.
        </p>
        <p className={styles.bodyElement}>All the best for your midterms! You got this 💪</p>
      </div>

      <div className={styles.buttons}>
        <Link to="/mpe" className="btn btn-primary">
          Plan now!
        </Link>
        {key && <CloseButton onClick={dismiss} />}
      </div>
    </div>
  );
});

export default Announcements;
