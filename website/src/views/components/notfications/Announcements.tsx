import { memo, useState, useCallback } from 'react';
import classnames from 'classnames';
import { Heart } from 'react-feather';

import storage from 'storage';
import { announcementKey } from 'storage/keys';
import CloseButton from 'views/components/CloseButton';
import styles from './Announcements.scss';

/**
 * If false, hides announcement.
 */
const enableAnnouncements = true;

/**
 * Unique key for the current announcement. If the announcement is not
 * dismissible, set the key to null. Otherwise, set it to a string.
 *
 * Previous keys:
 * - 'ay202122-new-data' - AY2021/22 data is available
 * - 'ay202021-new-data' - AY2020/21 data is available
 * - 'ay201920-new-data' - AY2019/20 data is available
 * - 'nusmods-is-official' - NUSMods switch to official APIs
 * - 'nusmods-r-announcement' - NUSMods R announcement message
 * - 'ay201819-new-data' - AY2018/19 data is available
 * - 'ay201819-s2-new-data' - S2 data available
 */
const key = announcementKey('ay202122-new-data');

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
        'alert alert-success no-export',
        styles.announcement,
        // styles.wrapButtons, // Uncomment if needed
      )}
    >
      <Heart className={styles.backgroundIcon} />

      <div className={styles.body}>
        <h3>AY2021/22 modules now available!</h3>
        <p className={styles.bodyElement}>
          NUSMods now has AY2021/22 module information available. The data is accurate but subject
          to changes. Happy new academic year!
        </p>
      </div>

      <div className={styles.buttons}>{key && <CloseButton onClick={dismiss} />}</div>
    </div>
  );
});

export default Announcements;
