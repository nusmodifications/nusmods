import { memo, useState, useCallback } from 'react';
import classnames from 'classnames';
import { Heart } from 'react-feather';

import storage from 'storage';
import { announcementKey } from 'storage/keys';
import CloseButton from 'views/components/CloseButton';
import styles from './Announcements.scss';

import Slider from 'react-styled-carousel';


/**
 * If false, hides announcement.
 */
const enableAnnouncements = true;

/**
 * Unique key for the current announcement. If the announcement is not
 * dismissible, set the key to null. Otherwise, set it to a string.
 *
 * Previous keys:
 * - 'ay202324-new-data' - AY2023/24 data is available
 * - 'ay202223-new-data' - AY2022/23 data is available
 * - 'vercel-migration-120522' - Announcement for possible outage for
 *                               migration out of Vercel team plan
 * - 'ay202122-2107-search-outage' - Module search outage apology
 * - 'ay202122-new-data' - AY2021/22 data is available
 * - 'ay202021-new-data' - AY2020/21 data is available
 * - 'ay201920-new-data' - AY2019/20 data is available
 * - 'nusmods-is-official' - NUSMods switch to official APIs
 * - 'nusmods-r-announcement' - NUSMods R announcement message
 * - 'ay201819-new-data' - AY2018/19 data is available
 * - 'ay201819-s2-new-data' - S2 data available
 */
const key = announcementKey('ay202324-new-data');

const Announcements = memo(() => {
  const [isOpen, setIsOpen] = useState(() => {
    if (!enableAnnouncements) return false;
    if (key) return !storage.getItem(key);
    return true;
  });

  // const dismiss = useCallback(() => {
  //   if (key) storage.setItem(key, true);
  //   setIsOpen(false);
  // }, []);

  // if (!isOpen) {
  //   return null;
  // }

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
        <h3>Requirement 1</h3>
        <p className={styles.bodyElement}>
          Find a mod that starts at 1200 MON, ends at 1400 MON.
        </p>
        <p className={styles.bodyElement}>
          Gud luck!
        </p>
        <Slider>
    <h1>1</h1>
    <h1>2</h1>
    <h1>3</h1>
    <h1>4</h1>
    <h1>5</h1>
  </Slider>
      </div>

      {/* <div className={styles.buttons}>{key && <CloseButton onClick={dismiss} />}</div> */}
    </div>
  );
});

export default Announcements;
