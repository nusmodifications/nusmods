import React, { useState } from 'react';
import classnames from 'classnames';
import { Zap } from 'react-feather';
import { FreeDayConflict, LessonOption } from './OptimiserContent';
import styles from './OptimiserButton.scss';
import { sendOptimiseRequest } from 'apis/optimiser';

interface OptimiserButtonProps {
  freeDayConflicts: FreeDayConflict[];
  lessonOptions: LessonOption[];
  acadYear: string;
  activeSemester: number;
  selectedFreeDays: Set<string>;
  earliestTime: string;
  latestTime: string;
  recordings: string[];
  earliestLunchTime: string;
  latestLunchTime: string;
  timetable: Record<string, any>;
  setShareableLink: (shareableLink: string) => void;
  setUnAssignedLessons: (unAssignedLessons: LessonOption[]) => void;
}

const OptimiserButton: React.FC<OptimiserButtonProps> = ({
  freeDayConflicts,
  lessonOptions,
  acadYear,
  activeSemester,
  selectedFreeDays,
  earliestTime,
  latestTime,
  recordings,
  earliestLunchTime,
  latestLunchTime,
  timetable,
  setShareableLink,
  setUnAssignedLessons,
}) => {
  const [isOptimising, setIsOptimising] = useState(false);

  const optimiseTimetable = async () => {
    try {
      setIsOptimising(true);
      setShareableLink(''); // Reset shareable link
      const modulesList = Object.keys(timetable);
      const formatTime = (time: string) => `${time.padStart(2, '0')}00`;
      const acadYearFormatted = `${acadYear.split('/')[0]}-${acadYear.split('/')[1]}`;

      const data = await sendOptimiseRequest(
        modulesList,
        acadYearFormatted,
        activeSemester,
        Array.from(selectedFreeDays),
        formatTime(earliestTime),
        formatTime(latestTime),
        recordings,
        formatTime(earliestLunchTime),
        formatTime(latestLunchTime),
      );

      if (data && data.shareableLink) {
        setShareableLink(data.shareableLink);
        const assignedLessons = new Set<string>();
        
        if (data.Assignments !== null && data.DaySlots) {
          data.DaySlots.forEach((day: any) => {
            day.forEach((slot: any) => {
              if (slot.LessonKey) {
                const moduleCode = slot.LessonKey.split('|')[0];
                const lessonType = slot.LessonKey.split('|')[1];
                assignedLessons.add(`${moduleCode} ${lessonType}`);
              }
            });
          });
        }
        
        setUnAssignedLessons(
          lessonOptions.filter((lesson) => !assignedLessons.has(lesson.displayText)),
        );
      } else {
        console.error('Failed to get response from optimiser API');
      }
    } catch (error) {
      console.error('Error optimising timetable:', error);
    } finally {
      setIsOptimising(false);
    }
  };

  return (
    <div className={styles.optimizeButtonSection}>
      <button
        type="button"
        className={classnames(
          'btn',
          styles.optimizeButton,
          freeDayConflicts.length > 0 || isOptimising || lessonOptions.length === 0
            ? styles.disabled
            : styles.enabled,
          {
            disabled: isOptimising || freeDayConflicts.length > 0 || lessonOptions.length === 0,
          },
        )}
        onClick={() => {
          optimiseTimetable();
        }}
      >
        {!isOptimising ? (
          <Zap
            size={20}
            fill={freeDayConflicts.length > 0 || lessonOptions.length === 0 ? '#69707a' : '#ff5138'}
          />
        ) : (
          <span className={styles.optimizeButtonSpinner}>
            {isOptimising && <div className={styles.grower} />}
          </span>
        )}
        {isOptimising ? 'Searching and optimising...' : 'Optimise Timetable'}
      </button>
      <div className={styles.estimateTime}>
        <div>estimated time:</div>
        <div className={styles.estimateTimeValue}>5s - 40s</div>
      </div>
    </div>
  );
};

export default OptimiserButton;
