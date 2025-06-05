import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import classnames from 'classnames';
import { Info, Cpu, X, Zap} from 'react-feather';
import Tooltip from 'views/components/Tooltip';
import { getSemesterTimetableColors, getSemesterTimetableLessons } from 'selectors/timetables';
import { State } from 'types/state';
import { ColorMapping } from 'types/reducers';
import { getModuleTimetable } from 'utils/modules';
import { LessonType, ModuleCode } from 'types/modules';
import { openNotification } from 'actions/app';
import { useDispatch } from 'react-redux';
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
  const dispatch = useDispatch();
  const [selectedLessons, setSelectedLessons] = useState<LessonOption[]>([]);
  const [selectedFreeDays, setSelectedFreeDays] = useState<Set<string>>(new Set());
  const [earliestTime, setEarliestTime] = useState<string>('08');
  const [latestTime, setLatestTime] = useState<string>('19');
  const [earliestLunchTime, setEarliestLunchTime] = useState<string>('12');
  const [latestLunchTime, setLatestLunchTime] = useState<string>('14');
  const [isOptimising, setIsOptimising] = useState(false);
  const [lessonDaysData, setLessonDaysData] = useState<LessonDaysData[]>([]);
  const [freeDayConflicts, setFreeDayConflicts] = useState<FreeDayConflict[]>([]);


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
    const selectedKeys = new Set(selectedLessons.map(lesson => lesson.uniqueKey));
    const conflicts: FreeDayConflict[] = [];
    
    // Check each non-recorded lesson
    lessonDaysData.forEach(lessonData => {
      // Skip if this lesson is recorded (selected)
      if (selectedKeys.has(lessonData.uniqueKey)) return;
      
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
  }, [selectedFreeDays, lessonDaysData, selectedLessons]);


  useEffect(() => {
    const availableKeys = new Set(lessonOptions.map(option => option.uniqueKey));
    setSelectedLessons(prev => prev.filter(lesson => availableKeys.has(lesson.uniqueKey)));
  }, [lessonOptions]);

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
    // Check for conflicts before optimizing
    if (freeDayConflicts.length > 0) {
      dispatch(openNotification(`Cannot optimize: You have ${freeDayConflicts.length} free day conflict(s). Please resolve them first.`));
      return;
    }

    setIsOptimising(true);
    const modulesList = Object.keys(timetable);
    const formatTime = (time: string) => time.padStart(2, '0') + '00';
    const recordings = selectedLessons.map(lesson => lesson.displayText);
    const acadYearFormatted = acadYear.split("/")[0] + "-" + acadYear.split("/")[1];

    const response = await fetch("https://optimiser-d469zrn5d-thejus-projects-c171061d.vercel.app/api/optimiser", {
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
    if (data.shareableLink) {
        window.open(data.shareableLink, '_blank');
    }
    setIsOptimising(false);
  }



  return (
    <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column"}}>
      <div style={{display: "flex", flexDirection: "row",alignItems: "center", justifyContent: "space-between"}}>
        <div style={{ fontFamily:"monospace", fontSize: "1.2rem", fontWeight: "bold", color:"#ff5138", display: "flex", alignItems: "center", gap: "0.5rem"}}>
          <Cpu size={25} style={{ color: "#ff5138" }} />
          Timetable Optimiser
        </div>
        <button style={{marginRight: "1rem"}} className="btn btn-sm btn-outline-success" onClick={() => window.open(config.contact.telegram, '_blank')}>
          Beta - Leave Feedback
        </button>
      </div>
        <div style={{ color:"GrayText", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "0.1rem", marginTop: "0.5rem"}}>
            <div>
                Intelligently explores millions of combinations to generate an ideal timetable — tailored to your
            </div>
            <div>
                preferred <b>free days, optimal class timings, comfortable lunch breaks, and minimal travel between classes</b>.
            </div>
        </div>
        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column"}} >
            <div style={{fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem"}}>
                Select lessons that are recorded in your timetable
                <Tooltip 
                    content="Choose only those recorded lessons that you're comfortable watching at your convenience"
                    placement="right"
                >
                    <Info className={`${styles.tag}`} size={15} style={{ color: "#69707a" }} />
                </Tooltip>
            </div>
            
            {/* Lesson Selection Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {lessonOptions.map((option) => {
                const isSelected = selectedLessons.some(lesson => lesson.uniqueKey === option.uniqueKey);
                return (
                  <button
                    key={option.uniqueKey}
                    type="button"
                    onClick={() => toggleLessonSelection(option)}
                    className={`color-${option.colorIndex} ${styles.lessonTag} ${styles.tag}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      padding: "0.5rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      borderRight: "none",
                      borderTop: "none",
                      borderLeft: "none",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      opacity: isSelected ? 1 : 0.6,
                      filter: isSelected ? "brightness(1)" : "brightness(0.8)",
                      transform: isSelected ? "scale(1)" : "scale(0.98)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.filter = 'brightness(1.1)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = isSelected ? '1' : '0.6';
                      e.currentTarget.style.filter = isSelected ? 'brightness(1)' : 'brightness(0.8)';
                      e.currentTarget.style.transform = isSelected ? 'scale(1)' : 'scale(0.98)';
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{option.displayText}</div>
                  </button>
                );
              })}
            </div>
            <div style={{fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "2rem"}}>
                Select days you would like to be free
                <Tooltip content="Chosen days will have no physical classes" placement="right">
                    <Info className={`${styles.tag}`} size={15} style={{ color: "#69707a" }} />
                </Tooltip>
            </div>
            <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", flexDirection: "row", gap: "0.5rem"}}>
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
              <div style={{ 
                marginTop: "1rem", 
                padding: "1rem", 
                backgroundColor: "rgba(255, 81, 56, 0.1)", 
                border: "1px solid rgba(255, 81, 56, 0.3)", 
                borderRadius: "0.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem"
              }}>
                <div style={{ 
                  fontSize: "1rem", 
                  fontWeight: "bold", 
                  color: "#ff5138",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <X size={20} />
                  Free Day Conflicts
                </div>
                <div style={{ fontSize: "0.9rem", color: "#69707a" }}>
                  The following lessons require physical attendance on your selected free days:
                </div>
                {freeDayConflicts.map((conflict, index) => (
                  <div key={index} style={{ 
                    fontSize: "0.9rem", 
                    color: "#ff5138",
                    fontWeight: "500",
                    marginLeft: "1rem"
                  }}>
                    • <strong>{conflict.displayText}</strong> happens on: {conflict.conflictingDays.join(', ')}
                  </div>
                ))}
                <div style={{ 
                  fontSize: "0.8rem", 
                  color: "#69707a",
                  fontStyle: "italic",
                  marginTop: "0.5rem"
                }}>
                  Consider marking these lessons as recorded or choosing different free days.
                </div>
              </div>
            )}

            <div style={{marginTop: "2rem", display: "flex", flexDirection: "row", gap: "3rem", flexWrap: "wrap"}}>
                <div style={{display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "200px"}}>
                    <div style={{fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem"}}>
                        Earliest class time
                        <Tooltip content="There will be no physical class before this time" placement="right">
                            <Info className={`${styles.tag}`} size={15} style={{ color: "#69707a" }} />
                        </Tooltip>
                    </div>
                    <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem"}}>
                        <select
                            className="form-select"
                            style={{
                                width: "5rem", 
                                padding: "0.25rem 0.75rem",
                                fontSize: "1.2rem",
                                border: "1px solid var(--gray-lighter)",
                                borderRadius: "0.25rem",
                                backgroundColor: "transparent",
                                color: "inherit",
                                outline: "none",
                                fontFamily: "monospace"
                            }}
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
                        <div style={{fontSize: "1.2rem", fontWeight: "500", color: "inherit", fontFamily: "monospace"}}>:00</div>
                    </div>
                </div>
                <div style={{display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "200px"}}>
                    <div style={{fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem"}}>
                        Latest class time
                        <Tooltip content="There will be no physical class after this time" placement="right">
                            <Info className={`${styles.tag}`} size={15} style={{ color: "#69707a" }} />
                        </Tooltip>
                    </div>
                    <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem"}}>
                        <select
                            className="form-select"
                            style={{
                                width: "5rem", 
                                padding: "0.25rem 0.75rem",
                                fontSize: "1.2rem",
                                border: "1px solid var(--gray-lighter)",
                                borderRadius: "0.25rem",
                                backgroundColor: "transparent",
                                color: "inherit",
                                outline: "none",
                                fontFamily: "monospace"
                            }}
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
                        <div style={{fontSize: "1.2rem", fontWeight: "500", color: "inherit", fontFamily: "monospace"}}>:00</div>
                    </div>
                </div>
            </div>
            <div style={{marginTop: "2rem", display: "flex", flexDirection: "row", gap: "3rem", flexWrap: "wrap"}}>
               <div style={{display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "200px"}}>
                    <div style={{fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem"}}>
                        Select range for preferred lunch break timings
                        <Tooltip content="Prioritises 1-hour lunch breaks in this range, if possible" placement="right">
                            <Info className={`${styles.tag}`} size={15} style={{ color: "#69707a" }} />
                        </Tooltip>
                    </div>
                    <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem"}}>
                        <select
                            className="form-select"
                            style={{width: "5rem", padding: "0.25rem 0.75rem", fontSize: "1.2rem", border: "1px solid var(--gray-lighter)", borderRadius: "0.25rem", backgroundColor: "transparent", color: "inherit", outline: "none", fontFamily: "monospace"}}
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
                        <div style={{fontSize: "1.2rem", fontWeight: "500", color: "inherit", fontFamily: "monospace"}}>:00</div>
                        <div style={{fontSize: "1rem", color: "#69707a", margin: "0 1.5rem"}}>to</div>
                        <select
                            className="form-select"
                            style={{width: "5rem", padding: "0.25rem 0.75rem", fontSize: "1.2rem", border: "1px solid var(--gray-lighter)", borderRadius: "0.25rem", backgroundColor: "transparent", color: "inherit", outline: "none", fontFamily: "monospace"}}
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
                        <div style={{fontSize: "1.2rem", fontWeight: "500", color: "inherit", fontFamily: "monospace"}}>:00</div>
                    </div>
                    
               </div> 
            </div>
            <div style={{marginTop: "2rem", display: "flex", flexDirection: "column"}}>
                <button 
                    className={classnames("btn",{
                        "disabled": isOptimising || freeDayConflicts.length > 0
                    })}
                    style={{
                        width: "fit-content",
                        padding: "0.75rem 2rem",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        backgroundColor: freeDayConflicts.length > 0 ? "#69707a" : "#ff5138",
                        color: "var(--body-bg)",
                        border: "none",
                        borderRadius: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: freeDayConflicts.length > 0 || isOptimising ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: freeDayConflicts.length > 0 || isOptimising ? "none" : "0 4px 12px rgba(255, 81, 56, 0.3)",
                    }}

                    onMouseEnter={(e) => {
                        if (freeDayConflicts.length === 0 && !isOptimising) {
                            e.currentTarget.style.backgroundColor = "#e04832";
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 81, 56, 0.4)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (freeDayConflicts.length === 0 && !isOptimising) {
                            e.currentTarget.style.backgroundColor = "#ff5138";
                            e.currentTarget.style.transform = "translateY(0px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 81, 56, 0.3)";
                        }
                    }}
                    onMouseDown={(e) => {
                        if (freeDayConflicts.length === 0 && !isOptimising) {
                            e.currentTarget.style.transform = "translateY(0px)";
                        }
                    }}
                    onMouseUp={(e) => {
                        if (freeDayConflicts.length === 0 && !isOptimising) {
                            e.currentTarget.style.transform = "translateY(-2px)";
                        }
                    }}
                    onClick={() => {
                        optimiseTimetable();
                    }}
                >
                    {!isOptimising ? <Zap size={20} fill='var(--body-bg)'/> : <span style={{display: "flex", alignItems: "center", gap: "1rem"}}>
                        {isOptimising && (
                            <div className={styles.grower}>
                            </div>
                        )}
                    </span>}
                    {isOptimising ? "Searching and optimising..." : "Optimise Timetable"}
                </button>
                <div style={{fontSize: "0.8rem", color: "#69707a", marginTop: "0.5rem", display: "flex", flexDirection: "row", gap: "0.5rem"}}>
                    <div>estimated time:</div>
                    <div style={{fontWeight: "bold"}}>5s - 40s</div>
                </div>
            </div>
        </div>
        
    </div>
  );
};

export default OptimiserContent;