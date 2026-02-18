import FAQComponent from './OptimiserFAQComponent';
import styles from './OptimiserFAQ.scss';

export default function OptimiserFAQContainer() {
  return (
    <>
      <div className={styles.faqTitle}>FAQ</div>
      <div className={styles.descriptionSection}>
        <FAQComponent
          question="What is the Timetable Optimiser?"
          body={
            <>
              <p className={styles.lede}>
                Having trouble planning your timetable? The optimiser explores thousands of possible
                timetable configurations to help you find one that best fits your preferences.
              </p>
              <div className={styles.bodyText}>
                You can indicate your preferences in the form above, and hit{' '}
                <i>Optimise Timetable</i> to generate an optimised timetable. When you click the{' '}
                <i>Open Optimised Timetable</i> button, it will bring you to a new page with the
                optimised timetable. If the timetable looks good to you, click <i>Import</i> to
                update your timetable.
              </div>
            </>
          }
        />
        <FAQComponent
          question="What does the optimiser prioritise?"
          body={
            <>
              <p className={styles.lede}>
                While the optimiser will try to generate a timetable that matches your preferences
                as closely as possible, there are certain preferences that may be harder to meet
                (due to course schedules and conflicts).
              </p>
              <div className={styles.bodyText}>
                When you submit your preferences, there will be 2 types of constraints:
                <b className={styles.boldConstraint}>Hard constraints</b>
                <ul>
                  <li>No live lessons on your chosen free days</li>
                  <li>No live lessons outside your preferred time range</li>
                </ul>
                <b className={styles.boldConstraint}>Soft constraints</b>
                <ul>
                  <li>Minimise travel distance between class venues</li>
                  <li>Prioritise lunch break within your preferred time range</li>
                  <li>
                    Prioritise having less than your chosen number of consecutive hours of study
                  </li>
                </ul>
              </div>
            </>
          }
        />

        <FAQComponent
          question="What happens when the optimiser can't generate a suitable timetable?"
          body={
            <>
              <p className={styles.bodyText}>
                If there happens to be conflicts in your selected modules or your preferences, the
                optimiser will still try to generate a timetable for you.
              </p>
              <div className={styles.bodyText}>
                However, it will only generate a <i>partial</i> timetable. You may have to edit the
                timetable manually in this case.
              </div>
            </>
          }
        />

        <FAQComponent
          question="What if I am a TA for a course?"
          body={
            <>
              <p className={styles.lede}>
                If you are a TA for a course, please remove that course from the list of modules to
                be optimised.
              </p>
              <div className={styles.bodyText}>
                This is because the optimiser does not take into account TA duties, and will
                schedule all lessons for that course as per normal.
              </div>
              <div className={styles.bodyText}>
                It is advised to manually add in your TA slots after optimisation to avoid any
                issues.
              </div>
            </>
          }
        />
      </div>
    </>
  );
}
