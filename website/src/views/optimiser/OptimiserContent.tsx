import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import classnames from 'classnames';
import { Info, Cpu, X, Zap, AlertTriangle} from 'react-feather';
import Tooltip from 'views/components/Tooltip';
import { getSemesterTimetableColors, getSemesterTimetableLessons } from 'selectors/timetables';
import { State } from 'types/state';
import { ColorMapping } from 'types/reducers';
import { getModuleTimetable } from 'utils/modules';
import { LessonType, ModuleCode } from 'types/modules';
import useMediaQuery from 'views/hooks/useMediaQuery';
import { breakpointDown } from 'utils/css';
import styles from './OptimiserContent.scss'; 
import config from 'config';

interface LessonOption {
  moduleCode: ModuleCode;
  lessonType: LessonType;
  colorIndex: number;
  displayText: string;
  uniqueKey: string;
}

interface LessonDaysData {
  uniqueKey: string;
  moduleCode: ModuleCode;
  lessonType: LessonType;
  displayText: string;
  days: Set<string>;
}

interface FreeDayConflict {
  moduleCode: ModuleCode;
  lessonType: LessonType;
  displayText: string;
  conflictingDays: string[];
}

const OptimiserContent: React.FC = () => {
  const activeSemester = useSelector(({ app }: State) => app.activeSemester);
  const colors: ColorMapping = useSelector(getSemesterTimetableColors)(activeSemester);
  const timetable = useSelector(getSemesterTimetableLessons)(activeSemester);
  const modules = useSelector(({ moduleBank }: State) => moduleBank.modules);
  const acadYear = useSelector((state : State) => state.timetables.academicYear);
  const isMobile = useMediaQuery(breakpointDown('md'));
  const [selectedLessons, setSelectedLessons] = useState<LessonOption[]>([]);
  const [selectedFreeDays, setSelectedFreeDays] = useState<Set<string>>(new Set());
  const [earliestTime, setEarliestTime] = useState<string>('08');
  const [latestTime, setLatestTime] = useState<string>('19');
  const [earliestLunchTime, setEarliestLunchTime] = useState<string>('12');
  const [latestLunchTime, setLatestLunchTime] = useState<string>('14');
  const [isOptimising, setIsOptimising] = useState(false);
  const [lessonDaysData, setLessonDaysData] = useState<LessonDaysData[]>([]);
  const [freeDayConflicts, setFreeDayConflicts] = useState<FreeDayConflict[]>([]);
  const [unAssignedLessons, setUnAssignedLessons] = useState<LessonOption[]>([]);
  const [recordings, setRecordings] = useState<string[]>([]);

  // Generate lesson options from current timetable
  const lessonOptions = useMemo(() => {
    const options: LessonOption[] = [];
    
    Object.keys(timetable).forEach(moduleCode => {
      const module = modules[moduleCode];
      if (!module) return;
      
      const moduleTimetable = getModuleTimetable(module, activeSemester);
      const colorIndex = colors[moduleCode] || 0;
      
      // Get unique lesson types for this module
      const lessonTypes = Array.from(new Set(moduleTimetable.map(lesson => lesson.lessonType)));
      
      lessonTypes.forEach(lessonType => {
        const uniqueKey = `${moduleCode}-${lessonType}`;
        const displayText = `${moduleCode} ${lessonType}`;
        
        options.push({
          moduleCode,
          lessonType,
          colorIndex,
          displayText,
          uniqueKey,
        });
      });
    });
    
    return options;
  }, [timetable, modules, activeSemester, colors]);


  useEffect(() => {
    // For each module and each lesson type that is not recorded, store all the days that lessons happen
    // so that we can check if the user selects all of those days as free days and throw an error
    const lessonDays: LessonDaysData[] = [];
    
    lessonOptions.forEach(option => {
      const module = modules[option.moduleCode];
      if (!module) return;
      
      const moduleTimetable = getModuleTimetable(module, activeSemester);
      const lessonsForType = moduleTimetable.filter(lesson => lesson.lessonType === option.lessonType);

      const days = new Set<string>();
      lessonsForType.forEach(lesson => {
        days.add(lesson.day);
      });
      
      lessonDays.push({
        uniqueKey: option.uniqueKey,
        moduleCode: option.moduleCode,
        lessonType: option.lessonType,
        displayText: option.displayText,
        days: days
      });
    });
    
    setLessonDaysData(lessonDays);
  }, [lessonOptions, modules, activeSemester]);

  // Validate free days against non-recorded lessons
  useEffect(() => {
    const recordingsSet = new Set(recordings);
    const conflicts: FreeDayConflict[] = [];
    
    // Check each non-recorded lesson (physical lessons that user plans to attend)
    lessonDaysData.forEach(lessonData => {
      // Skip if this lesson is recorded (not attending in person)
      if (recordingsSet.has(lessonData.displayText)) return;
      
      // Check if ALL days for this lesson are selected as free days
      const lessonDaysArray = Array.from(lessonData.days);
      const conflictingDays = lessonDaysArray.filter(day => selectedFreeDays.has(day));
      
      // If all lesson days are selected as free days, it's a conflict
      if (conflictingDays.length === lessonDaysArray.length && conflictingDays.length > 0) {
        conflicts.push({
          moduleCode: lessonData.moduleCode,
          lessonType: lessonData.lessonType,
          displayText: lessonData.displayText,
          conflictingDays: conflictingDays
        });
      }
    });
    
    setFreeDayConflicts(conflicts);
  }, [selectedFreeDays, lessonDaysData, recordings]);


  useEffect(() => {
    const availableKeys = new Set(lessonOptions.map(option => option.uniqueKey));
    setSelectedLessons(prev => prev.filter(lesson => availableKeys.has(lesson.uniqueKey)));
  }, [lessonOptions]);

  // Update recordings whenever selectedLessons or lessonOptions change
  useEffect(() => {
    const selectedKeys = new Set(selectedLessons.map(lesson => lesson.uniqueKey));
    const newRecordings = lessonOptions
      .filter(lesson => !selectedKeys.has(lesson.uniqueKey))
      .map(lesson => lesson.displayText);
    setRecordings(newRecordings);
  }, [selectedLessons, lessonOptions]);

  const toggleLessonSelection = useCallback((option: LessonOption) => {
    const isSelected = selectedLessons.some(lesson => lesson.uniqueKey === option.uniqueKey);
    
    if (isSelected) {
      setSelectedLessons(prev => prev.filter(lesson => lesson.uniqueKey !== option.uniqueKey));
    } else {
      setSelectedLessons(prev => [...prev, option]);
    }
  }, [selectedLessons]);

  const toggleFreeDay = useCallback((day: string) => {
    setSelectedFreeDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      } 
      return newSet;
    });
  }, []);


  const optimiseTimetable = async () => {

    setIsOptimising(true);
    const modulesList = Object.keys(timetable);
    const formatTime = (time: string) => time.padStart(2, '0') + '00';
    const acadYearFormatted = acadYear.split("/")[0] + "-" + acadYear.split("/")[1];

    const response = await fetch("https://optimiser-j3ory0gly-thejus-projects-c171061d.vercel.app/api/optimiser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            modules: modulesList,
            acadYear: acadYearFormatted,
            acadSem: activeSemester,
            freeDays: Array.from(selectedFreeDays),
            earliestTime: formatTime(earliestTime),
            latestTime: formatTime(latestTime),
            recordings: recordings,
            lunchStart: formatTime(earliestLunchTime),
            lunchEnd: formatTime(latestLunchTime),
        })
    });
    const data = await response.json();
    console.log(data)
    if (data.shareableLink) {
        const assignedLessons = new Set<string>();
        if (data.Assignments !== null) {
          data.DaySlots.forEach((day: any) => {
            day.forEach((slot: any) => {
              if (slot.LessonKey) {
                const moduleCode = slot.LessonKey.split("|")[0];
                const lessonType = slot.LessonKey.split("|")[1];
                assignedLessons.add(`${moduleCode} ${lessonType}`);
              }
            });
          }); 
        }
        setUnAssignedLessons(lessonOptions.filter(lesson => !assignedLessons.has(lesson.displayText)));
        window.open(data.shareableLink, '_blank');
    }
    setIsOptimising(false);
  }



  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Cpu size={isMobile ? 22 : 25} className={styles.titleIcon} />
          Timetable Optimiser
        </div>
        <button className={classnames("btn btn-sm btn-outline-success", styles.feedbackButton)} onClick={() => window.open(config.contact.telegram, '_blank')}>
          Beta - Leave Feedback
        </button>
      </div>
        <div className={styles.description}>
            <div>
                Intelligently explores millions of combinations to generate your optimal timetable — prioritising
            </div>
            <div>
                <b>preferred free days, ideal class timings, lunch flexibility, and minimal travel between classes</b>.
            </div>
        </div>
        <div className={styles.mainContent}>
            <div className={styles.sectionHeader}>
                Select lessons you plan to attend physically (in person, online, or other format)
                <Tooltip 
                    content="Chosen lessons will only be allocated on your school days"
                    placement="right"
                >
                    <Info className={`${styles.tag} ${styles.infoIcon}`} size={15} />
                </Tooltip>
            </div>
            
            {/* Lesson Selection Buttons */}
            <div className={styles.lessonButtons}>
              {lessonOptions.map((option) => {
                const isSelected = selectedLessons.some(lesson => lesson.uniqueKey === option.uniqueKey);
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
                      isSelected ? styles.selected : styles.unselected
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
                    'active': selectedFreeDays.has('Monday')
                  })}
                  onClick={() => toggleFreeDay('Monday')}
                > 
                  Monday 
                </button>
                <button 
                  type="button" 
                  className={classnames('btn btn-outline-primary btn-svg', {
                    'active': selectedFreeDays.has('Tuesday')
                  })}
                  onClick={() => toggleFreeDay('Tuesday')}
                > 
                  Tuesday 
                </button>
                <button 
                  type="button" 
                  className={classnames('btn btn-outline-primary btn-svg', {
                    'active': selectedFreeDays.has('Wednesday')
                  })}
                  onClick={() => toggleFreeDay('Wednesday')}
                > 
                  Wednesday 
                </button>
                <button 
                  type="button" 
                  className={classnames('btn btn-outline-primary btn-svg', {
                    'active': selectedFreeDays.has('Thursday')
                  })}
                  onClick={() => toggleFreeDay('Thursday')}
                > 
                  Thursday 
                </button>
                <button 
                  type="button" 
                  className={classnames('btn btn-outline-primary btn-svg', {
                    'active': selectedFreeDays.has('Friday')
                  })}
                  onClick={() => toggleFreeDay('Friday')}
                > 
                  Friday 
                </button>
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
                    • <strong>{conflict.displayText}</strong> happens on: {conflict.conflictingDays.join(', ')}
                  </div>
                ))}
                <div className={styles.conflictFooter}>
                  Consider marking these lessons as non-physical or choosing different free days.
                </div>
              </div>
            )}

            <div className={styles.timeControls}>
                <div className={styles.timeControlWrapper}>

                  <div className={styles.timeControlGroup}>
                      <div className={styles.timeControlHeader}>
                          Earliest class time
                          <Tooltip content="There will be no physical class before this time" placement="right">
                              <Info className={`${styles.tag} ${styles.infoIcon}`} size={15} />
                          </Tooltip>
                      </div>
                      <div className={styles.timeControlRow}>
                          <select
                              className={classnames("form-select", styles.timeSelect)}
                              value={earliestTime}
                              onChange={(e) => setEarliestTime(e.target.value)}
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
                          </select>
                          <div className={styles.timeLabel}>:00</div>
                      </div>
                  </div>
                  <div className={styles.timeControlGroup}>
                      <div className={styles.timeControlHeader}>
                          Latest class time
                          <Tooltip content="There will be no physical class after this time" placement="right">
                              <Info className={`${styles.tag} ${styles.infoIcon}`} size={15} />
                          </Tooltip>
                      </div>
                      <div className={styles.timeControlRow}>
                          <select
                              className={classnames("form-select", styles.timeSelect)}
                              value={latestTime}
                              onChange={(e) => setLatestTime(e.target.value)}
                          >
                              <option value="08">09</option>
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
                        <Tooltip content="Prioritises 1-hour lunch breaks in this range, if possible" placement="right">
                            <Info className={`${styles.tag} ${styles.infoIcon}`} size={15} />
                        </Tooltip>
                    </div>
                    <div className={styles.lunchControlRow}>
                        <select
                            className={classnames("form-select", styles.lunchSelect)}
                            value={earliestLunchTime}
                            onChange={(e) => setEarliestLunchTime(e.target.value)}
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
                            className={classnames("form-select", styles.lunchSelect)}
                            value={latestLunchTime}
                            onChange={(e) => setLatestLunchTime(e.target.value)}
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
            <div className={styles.optimizeButtonSection}>
                <button 
                    className={classnames(
                      "btn",
                      styles.optimizeButton,
                      freeDayConflicts.length > 0 || isOptimising ? styles.disabled : styles.enabled,
                      {
                        "disabled": isOptimising || freeDayConflicts.length > 0
                      }
                    )}
                    onClick={() => {
                        optimiseTimetable();
                    }}
                >
                    {!isOptimising ? <Zap size={20} fill={freeDayConflicts.length > 0 ? "#69707a" : "#ff5138"} /> : <span className={styles.optimizeButtonSpinner}>
                        {isOptimising && (
                            <div className={styles.grower}>
                            </div>
                        )}
                    </span>}
                    {isOptimising ? "Searching and optimising..." : "Optimise Timetable"}
                </button>
                <div className={styles.estimateTime}>
                    <div>estimated time:</div>
                    <div className={styles.estimateTimeValue}>5s - 40s</div>
                </div>
            </div>

            {/* Unassigned Lessons Disclaimer */}
            {unAssignedLessons.length > 0 && (
              <div className={styles.unassignedWarning}>
                <div className={styles.unassignedHeader}>
                  <AlertTriangle size={24} />
                  Optimiser Warning : Unassigned Lessons
                </div>
                
                <div className={styles.unassignedDescription}>
                  The following lessons couldn't be assigned to your optimised timetable:
                </div>
                
                <div className={styles.unassignedLessons}>
                  {unAssignedLessons.map((lesson, index) => (
                    <div
                      key={index}
                      className={classnames(
                        `color-${lesson.colorIndex}`,
                        styles.lessonTag,
                        styles.tag,
                        styles.unassignedLessonTag
                      )}
                    >
                      {lesson.displayText}
                    </div>
                  ))}
                </div>
                
                <div className={styles.unassignedExplanation}>
                  <div className={styles.unassignedExplanationHeader}>
                    Why did this happen?
                  </div>
                  <div className={styles.unassignedExplanationItem}>
                    • <strong>Venue constraints:</strong> NUSMods may not have complete or accurate venue data for these lessons
                  </div>
                  <div className={styles.unassignedExplanationItem}>
                    • <strong>Scheduling conflicts:</strong> There is no possible way to schedule these lessons with your selected preferences (free days, time ranges, etc.)
                  </div>
                </div>
                
                <div className={styles.unassignedFooter}>
                  You may need to manually add these lessons to your timetable or adjust your optimisation preferences
                </div>
              </div>
            )}
        </div>
        
    </div>
  );
};

export default OptimiserContent;