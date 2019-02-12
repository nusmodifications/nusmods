import * as React from 'react';
import styles from './NoLessonWarning.scss';

export default function NoLessonWarning() {
  return (
    <div className={styles.warningOverlay}>
      <div className={styles.warning}>
        <h3>Timetable information not available</h3>
        <p>
          In the meantime you can still plan your modules and exams for this semester. We&apos;ll
          put up an announcement when the information becomes available. Stay tuned!
        </p>
      </div>
    </div>
  );
}
