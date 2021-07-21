import { memo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { Search } from 'react-feather';

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
 * - 'ay202122-2107-search-outage' - Module search outage apology
 * - 'ay202122-new-data' - AY2021/22 data is available
 * - 'ay202021-new-data' - AY2020/21 data is available
 * - 'ay201920-new-data' - AY2019/20 data is available
 * - 'nusmods-is-official' - NUSMods switch to official APIs
 * - 'nusmods-r-announcement' - NUSMods R announcement message
 * - 'ay201819-new-data' - AY2018/19 data is available
 * - 'ay201819-s2-new-data' - S2 data available
 */
const key = announcementKey('ay202122-2107-search-outage');

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
        'alert alert-info no-export',
        styles.announcement,
        // styles.wrapButtons, // Uncomment if needed
      )}
    >
      <Search className={styles.backgroundIcon} />

      <div className={styles.body}>
        <h3>Module search is now working!</h3>
        <p className={styles.bodyElement}>
          We've noticed that some of you have recently faced issues with our{' '}
          <Link
            className={styles.announcementLink}
            to={{ pathname: '/modules', search: '?sem[0]=1&sem[1]=2&sem[2]=3&sem[3]=4' }}
          >
            module search page
          </Link>{' '}
          and we've fixed it. Sorry for the inconvenience, and all the best for ModReg!
        </p>
      </div>

      <div className={styles.buttons}>{key && <CloseButton onClick={dismiss} />}</div>
    </div>
  );
});

export default Announcements;
