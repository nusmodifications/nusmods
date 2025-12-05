import React, { useState } from 'react';
import classnames from 'classnames';
import styles from './OptimiserDescription.scss';

const OptimiserDescription: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className={styles.descriptionSection}>
      <div
        className={classnames('accordion', styles.accordion)}
        id="optimiserDescriptionAccordion"
      >
        <div className="card">
          <div className={classnames('card-header', styles.cardHeader)} id="optimiserAccordionHeading">
            <button
              className={classnames('btn btn-link', styles.toggleButton, {
                [styles.collapsed]: !isOpen,
              })}
              type="button"
              aria-expanded={isOpen}
              aria-controls="optimiserAccordionBody"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <span className={styles.titleText}>What does the optimiser do?</span>
              <span className={styles.toggleIcon}>{isOpen ? '−' : '+'}</span>
            </button>
          </div>
          <div
            id="optimiserAccordionBody"
            className={classnames('collapse', styles.collapse, {
              show: isOpen,
              [styles.open]: isOpen,
            })}
            aria-labelledby="optimiserAccordionHeading"
            data-parent="#optimiserDescriptionAccordion"
          >
            <div className={classnames('card-body', styles.cardBody)}>
              <div className={styles.bodyContent}>
                <p className={styles.lede}>
                  The optimiser will explore thousands of timetable combination amongst your selected modules that meet your preferences and return an optimal one.
                </p>
                <p className={styles.bodyText}>
                  The returned timetable will be optimised for the following preferences:
                  <ul>
                    <b className={styles.boldConstraint}>Hard constraints</b>
                    <li>No live lessons on your chosen free days</li>
                    <li>No live lessons outside your preferred time range</li>
                    
                    <b className={styles.boldConstraint}>Soft constraints</b>
                    <li>Minimise travel distance between class venues</li>
                    <li>Prioritise lunch break within your preferred time range</li>
                    <li>Prioritise having less than your chosen number of consecutive hours of study</li>
                  </ul>
                   
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimiserDescription;
