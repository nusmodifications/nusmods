import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';
import { AlertTriangle, Zap, ExternalLink } from 'react-feather';
import { LessonOption } from 'types/optimiser';
import { isEmpty } from 'lodash';
import styles from './OptimiserResults.scss';

export interface OptimiserResultsProps {
  shareableLink: string | null;
  defaultShareableLink: string | null;
  unassignedLessons: LessonOption[];
}

const OptimiserResults: React.FC<OptimiserResultsProps> = ({
  shareableLink,
  defaultShareableLink,
  unassignedLessons,
}) => {
  const optimiserResultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = optimiserResultsRef.current;
    if (element && shareableLink) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [shareableLink]);

  if (!shareableLink) {
    return null;
  }

  return (
    <div ref={optimiserResultsRef}>
      {isEmpty(unassignedLessons) ? (
        <OptimiserResultsFullTimetable shareableLink={shareableLink} />
      ) : (
        <OptimiserResultPartialTimetable
          shareableLink={shareableLink}
          defaultShareableLink={defaultShareableLink}
          unassignedLessons={unassignedLessons}
        />
      )}
    </div>
  );
};

interface OptimiserResultsPartialProps {
  shareableLink: string;
  defaultShareableLink: string | null;
  unassignedLessons: LessonOption[];
}

const OptimiserResultPartialTimetable: React.FC<OptimiserResultsPartialProps> = ({
  shareableLink,
  defaultShareableLink,
  unassignedLessons,
}) => (
  <div className={styles.unassignedWarning}>
    <div className={styles.unassignedHeader}>
      <AlertTriangle size={24} />
      Partial Timetable Generated
    </div>

    <div className={styles.unassignedDescription}>
      We successfully optimised most of your timetable, but these lessons couldn't be scheduled based on your preferences:
    </div>

    <div className={styles.unassignedLessons}>
      {unassignedLessons.map((lesson, index) => (
        <div
          key={index}
          className={classnames(
            `color-${lesson.colorIndex}`,
            styles.lessonTag,
            styles.unassignedLessonTag,
          )}
        >
          {lesson.displayText}
        </div>
      ))}
    </div>

    <div className={styles.unassignedExplanation}>
      <div className={styles.unassignedExplanationHeader}>Why couldn't these be scheduled?</div>
      <ul>
        <li className={styles.unassignedExplanationItem}>
          Missing venue information, or
        </li>
        <li className={styles.unassignedExplanationItem}>
          No possible way to schedule these lessons with your selected preferences (e.g., free days, preferred hours)
        </li>
      </ul>
    </div>

    <div className={styles.unassignedExplanation}>
      <div className={styles.unassignedExplanationHeader}>Choose how to view your timetable:</div>
      <ul>
        <li className={styles.unassignedExplanationItem}>
          <strong>Optimised lessons only:</strong> View just the lessons we successfully scheduled. You'll manually add the others later.
        </li>
        {defaultShareableLink && (
          <li className={styles.unassignedExplanationItem}>
            <strong>All lessons:</strong> View the optimised schedule plus the missing lessons added at a random slot (may conflict with your preferences).
          </li>
        )}
      </ul>
    </div>

    <div className={styles.warningButtonContainer}>
      <a className={styles.warningShareableButton} href={shareableLink} target="blank">
        <ExternalLink size={20} />
        View Optimised Lessons Only
      </a>
      {defaultShareableLink && (
        <a className={styles.warningShareableButton} href={defaultShareableLink} target="blank">
          <ExternalLink size={20} />
          View All Lessons
        </a>
      )}
    </div>
  </div>
);

interface OptimiserResultsFullTimetableProps {
  shareableLink: string;
}

const OptimiserResultsFullTimetable: React.FC<OptimiserResultsFullTimetableProps> = ({
  shareableLink,
}) => (
  <div className={styles.shareableLinkSection}>
    <div className={styles.successMessage}>
      <div className={styles.successHeader}>
        <Zap size={24} fill="#28a745" />
        Optimisation Complete!
      </div>
      <div className={styles.successDescription}>
        Your optimised timetable is ready. Click below to view it in a new tab.
      </div>
    </div>

    <a className={styles.shareableLinkButton} href={shareableLink} target="blank">
      <ExternalLink size={20} />
      Open Optimised Timetable
    </a>
  </div>
);

export default OptimiserResults;
