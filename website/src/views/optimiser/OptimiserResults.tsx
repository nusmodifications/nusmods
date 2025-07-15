import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';
import { AlertTriangle, Zap, ExternalLink } from 'react-feather';
import { LessonOption } from 'types/optimiser';
import { isEmpty } from 'lodash';
import styles from './OptimiserResults.scss';

export interface OptimiserResultsProps {
  shareableLink: string;
  unassignedLessons: LessonOption[];
}

const OptimiserResults: React.FC<OptimiserResultsProps> = ({
  shareableLink,
  unassignedLessons,
}) => {
  const optimiserResultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [shareableLink]);

  const scrollToBottom = () => {
    const element = optimiserResultsRef.current;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openOptimisedTimetable = () => {
    if (shareableLink) {
      window.open(shareableLink, '_blank');
    }
  };

  return (
    !!shareableLink && (
      <div ref={optimiserResultsRef}>
        {/* Partially optimised timetable */}
        {!isEmpty(unassignedLessons) && (
          <div className={styles.unassignedWarning}>
            <div className={styles.unassignedHeader}>
              <AlertTriangle size={24} />
              Optimiser Warning : Unassigned Lessons
            </div>

            <div className={styles.unassignedDescription}>
              The following lessons couldn't be assigned to your optimised timetable:
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
              <div className={styles.unassignedExplanationHeader}>Why did this happen?</div>
              <div className={styles.unassignedExplanationItem}>
                • <strong>Venue constraints:</strong> NUSMods may not have complete or accurate
                venue data for these lessons
              </div>
              <div className={styles.unassignedExplanationItem}>
                • <strong>Scheduling conflicts:</strong> There is no possible way to schedule these
                lessons with your selected preferences (free days, time ranges, etc.)
              </div>
            </div>

            <div className={styles.warningButtonContainer}>
              <button
                type="button"
                className={styles.warningShareableButton}
                onClick={openOptimisedTimetable}
              >
                <ExternalLink size={20} />
                Open Partial Timetable
              </button>
            </div>

            <div className={styles.unassignedFooter}>
              You may need to manually add these lessons to your timetable or adjust your
              optimisation preferences
            </div>
          </div>
        )}

        {/* Fully optimised timetable */}
        {isEmpty(unassignedLessons) && (
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
            <button
              type="button"
              className={styles.shareableLinkButton}
              onClick={openOptimisedTimetable}
            >
              <ExternalLink size={20} />
              Open Optimised Timetable
            </button>
          </div>
        )}
      </div>
    )
  );
};

export default OptimiserResults;
