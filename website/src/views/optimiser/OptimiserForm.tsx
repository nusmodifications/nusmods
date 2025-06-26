import React, { useCallback } from 'react';
import classnames from 'classnames';
import { Info, X, AlertTriangle } from 'react-feather';
import Tooltip from 'views/components/Tooltip';
import { LessonOption, FreeDayConflict } from './types';
import styles from './OptimiserForm.scss';

interface OptimiserFormProps {
  lessonOptions: LessonOption[];
  selectedLessons: LessonOption[];
  selectedFreeDays: Set<string>;
  earliestTime: string;
  latestTime: string;
  earliestLunchTime: string;
  latestLunchTime: string;
  freeDayConflicts: FreeDayConflict[];
  onToggleLessonSelection: (option: LessonOption) => void;
  onToggleFreeDay: (day: string) => void;
  onEarliestTimeChange: (time: string) => void;
  onLatestTimeChange: (time: string) => void;
  onEarliestLunchTimeChange: (time: string) => void;
  onLatestLunchTimeChange: (time: string) => void;
  hasSaturday: boolean;
}

const OptimiserForm: React.FC<OptimiserFormProps> = ({
  lessonOptions,
  selectedLessons,
  selectedFreeDays,
  earliestTime,
  latestTime,
  earliestLunchTime,
  latestLunchTime,
  freeDayConflicts,
  onToggleLessonSelection,
  onToggleFreeDay,
  onEarliestTimeChange,
  onLatestTimeChange,
  onEarliestLunchTimeChange,
  onLatestLunchTimeChange,
  hasSaturday,
}) => {
  const toggleLessonSelection = useCallback(
    (option: LessonOption) => {
      onToggleLessonSelection(option);
    },
    [onToggleLessonSelection],
  );

  const toggleFreeDay = useCallback(
    (day: string) => {
      onToggleFreeDay(day);
    },
    [onToggleFreeDay],
  );

  return (
    <div className={styles.mainContent}>
      <div className={styles.sectionHeader}>
        <div>
          Select lessons you plan to attend live (in person, online, or other format)
          <Tooltip
            content="Chosen lessons will only be allocated on your school days"
            placement="right"
          >
            <Info className={`${styles.tag} ${styles.infoIcon}`} style={{marginLeft: '0.5rem'}} size={15} />
          </Tooltip>
        </div>
      </div>

      {/* Lesson Selection Buttons */}
      <div className={styles.lessonButtons}>
        {lessonOptions.length === 0 && (
          <div className={styles.noLessonsFound}>
            <div className={styles.noLessonsHeader}>
              <AlertTriangle size={20} />
              No Lessons Found
            </div>
            <div className={styles.noLessonsDescription}>
              Add modules to your timetable to see lesson options here
            </div>
          </div>
        )}
        {lessonOptions.map((option) => {
          const isSelected = selectedLessons.some(
            (lesson) => lesson.uniqueKey === option.uniqueKey,
          );
          return (
            <button
              key={option.uniqueKey}
              type="button"
              onClick={() => toggleLessonSelection(option)}
              className={classnames(
                `color-${option.colorIndex}`,
                styles.lessonTag,
                styles.tag,
                styles.lessonButton,
                isSelected ? styles.selected : styles.unselected,
              )}
            >
              <div className={styles.lessonButtonText}>{option.displayText}</div>
            </button>
          );
        })}
      </div>

      <div className={styles.freeDaysSection}>
        Select days you would like to be free
        <Tooltip content="Chosen days will have no physical classes" placement="right">
          <Info className={`${styles.tag} ${styles.infoIcon}`} size={15} />
        </Tooltip>
      </div>
      <div className={styles.freeDaysButtons}>
        <button
          type="button"
          className={classnames('btn btn-outline-primary btn-svg', {
            active: selectedFreeDays.has('Monday'),
          })}
          onClick={() => toggleFreeDay('Monday')}
        >
          Monday
        </button>
        <button
          type="button"
          className={classnames('btn btn-outline-primary btn-svg', {
            active: selectedFreeDays.has('Tuesday'),
          })}
          onClick={() => toggleFreeDay('Tuesday')}
        >
          Tuesday
        </button>
        <button
          type="button"
          className={classnames('btn btn-outline-primary btn-svg', {
            active: selectedFreeDays.has('Wednesday'),
          })}
          onClick={() => toggleFreeDay('Wednesday')}
        >
          Wednesday
        </button>
        <button
          type="button"
          className={classnames('btn btn-outline-primary btn-svg', {
            active: selectedFreeDays.has('Thursday'),
          })}
          onClick={() => toggleFreeDay('Thursday')}
        >
          Thursday
        </button>
        <button
          type="button"
          className={classnames('btn btn-outline-primary btn-svg', {
            active: selectedFreeDays.has('Friday'),
          })}
          onClick={() => toggleFreeDay('Friday')}
        >
          Friday
        </button>
        {hasSaturday && (
          <button
            type="button"
            className={classnames('btn btn-outline-primary btn-svg', {
              active: selectedFreeDays.has('Saturday'),
            })}
            onClick={() => toggleFreeDay('Saturday')}
          >
            Saturday
          </button>
        )}
      </div>

      {/* Free Day Conflicts Display */}
      {freeDayConflicts.length > 0 && (
        <div className={styles.conflictWarning}>
          <div className={styles.conflictHeader}>
            <X size={20} />
            Free Day Conflicts
          </div>
          <div className={styles.conflictDescription}>
            The following lessons require physical attendance on your selected free days:
          </div>
          {freeDayConflicts.map((conflict, index) => (
            <div key={index} className={styles.conflictItem}>
              • <strong>{conflict.displayText}</strong> happens on:{' '}
              {conflict.conflictingDays.join(', ')}
            </div>
          ))}
          <div className={styles.conflictFooter}>
            Consider disabling live attendance for these lessons or selecting different free days.
          </div>
        </div>
      )}

      <div className={styles.timeControls}>
        <div className={styles.timeControlWrapper}>
          <div className={styles.timeControlGroup}>
            <div className={styles.timeControlHeader}>
              Earliest start time
              <Tooltip content="There will be no physical class before this time" placement="right">
                <Info className={`${styles.tag} ${styles.infoIcon}`} size={15} />
              </Tooltip>
            </div>
            <div className={styles.timeControlRow}>
              <select
                className={classnames('form-select', styles.timeSelect)}
                value={earliestTime}
                onChange={(e) => onEarliestTimeChange(e.target.value)}
              >
                <option value="08">08</option>
                <option value="09">09</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="13">13</option>
                <option value="14">14</option>
                <option value="15">15</option>
                <option value="16">16</option>
                <option value="17">17</option>
                <option value="18">18</option>
                <option value="19">19</option>
                <option value="20">20</option>
                <option value="21">21</option>
                <option value="22">22</option>
              </select>
              <div className={styles.timeLabel}>:00</div>
            </div>
          </div>
          <div className={styles.timeControlGroup}>
            <div className={styles.timeControlHeader}>
              Latest end time
              <Tooltip content="There will be no physical class after this time" placement="right">
                <Info className={`${styles.tag} ${styles.infoIcon}`} size={15} />
              </Tooltip>
            </div>
            <div className={styles.timeControlRow}>
              <select
                className={classnames('form-select', styles.timeSelect)}
                value={latestTime}
                onChange={(e) => onLatestTimeChange(e.target.value)}
              >
                <option value="09">09</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="13">13</option>
                <option value="14">14</option>
                <option value="15">15</option>
                <option value="16">16</option>
                <option value="17">17</option>
                <option value="18">18</option>
                <option value="19">19</option>
                <option value="20">20</option>
                <option value="21">21</option>
                <option value="22">22</option>
                <option value="23">23</option>
              </select>
              <div className={styles.timeLabel}>:00</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.lunchControls}>
        <div className={styles.lunchControlGroup}>
          <div className={styles.lunchControlHeader}>
            Select range for preferred lunch break timings
            <Tooltip
              content="Prioritises 1-hour lunch breaks in this range, if possible"
              placement="right"
            >
              <Info className={`${styles.tag} ${styles.infoIcon}`} size={15} />
            </Tooltip>
          </div>
          <div className={styles.lunchControlRow}>
            <select
              className={classnames('form-select', styles.timeSelect)}
              value={earliestLunchTime}
              onChange={(e) => onEarliestLunchTimeChange(e.target.value)}
            >
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
              <option value="15">15</option>
              <option value="16">16</option>
            </select>
            <div className={styles.lunchTimeLabel}>:00</div>
            <div className={styles.lunchTimeSeparator}>to</div>
            <select
              className={classnames('form-select', styles.timeSelect)}
              value={latestLunchTime}
              onChange={(e) => onLatestLunchTimeChange(e.target.value)}
            >
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
              <option value="15">15</option>
              <option value="16">16</option>
              <option value="17">17</option>
            </select>
            <div className={styles.lunchTimeLabel}>:00</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimiserForm;
