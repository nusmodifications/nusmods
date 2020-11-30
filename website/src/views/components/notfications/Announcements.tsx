import { memo, useState, useCallback } from 'react';
import classnames from 'classnames';
import { Sun } from 'react-feather';

import storage from 'storage';
import { announcementKey } from 'storage/keys';
import CloseButton from 'views/components/CloseButton';
import styles from './Announcements.scss';

/**
 * If false, hides announcement.
 */
const enableAnnouncements = false;

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
const key = announcementKey('ay202021-new-data');

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
    <div className={classnames('alert alert-success no-export', styles.announcement)}>
      <Sun className={styles.backgroundIcon} />

      <div className={styles.body}>
        <h3>AY2020/21 module information is available!</h3>
        <p className={styles.bodyElement}>Happy new academic year! Please note:</p>
        <ul className={styles.bodyElement}>
          <li>Class timetables are subject to changes.</li>
          <li>
            Due to the evolving COVID-19 situation, only Semester 1 examination timetables are
            available.
          </li>
        </ul>
      </div>

      {key && <CloseButton onClick={dismiss} />}
    </div>
  );
});

export default Announcements;
