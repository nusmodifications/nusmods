import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Downshift, { ChildrenFunction } from 'downshift';
import classnames from 'classnames';
import { Info, Cpu, X } from 'react-feather';
import Tooltip from 'views/components/Tooltip';
import { getSemesterTimetableColors, getSemesterTimetableLessons } from 'selectors/timetables';
import { State } from 'types/state';
import { ColorMapping } from 'types/reducers';
import { getModuleTimetable } from 'utils/modules';
import { LessonType, ModuleCode } from 'types/modules';
import selectStyles from './ModulesSelect.scss'; 
import styles from './OptimiserContent.scss'; 

interface LessonOption {
  moduleCode: ModuleCode;
  lessonType: LessonType;
  colorIndex: number;
  displayText: string;
  uniqueKey: string;
}

const OptimiserContent: React.FC = () => {
  const activeSemester = useSelector(({ app }: State) => app.activeSemester);
  const colors: ColorMapping = useSelector(getSemesterTimetableColors)(activeSemester);
  const timetable = useSelector(getSemesterTimetableLessons)(activeSemester);
  const modules = useSelector(({ moduleBank }: State) => moduleBank.modules);
  
  const [selectedLessons, setSelectedLessons] = useState<LessonOption[]>([]);
  const [selectedFreeDays, setSelectedFreeDays] = useState<Set<string>>(new Set());
  const [earliestTime, setEarliestTime] = useState<string>('08');
  const [latestTime, setLatestTime] = useState<string>('19');
  const [isOpen, setIsOpen] = useState(false);
  const [recordedInputValue, setRecordedInputValue] = useState('');
  const [earliestLunchTime, setEarliestLunchTime] = useState<string>('12');
  const [latestLunchTime, setLatestLunchTime] = useState<string>('14');

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

  // Filter options based on input and exclude already selected ones
  const filteredOptions = useMemo(() => {
    if (!recordedInputValue) return [];
    
    const selectedKeys = new Set(selectedLessons.map(lesson => lesson.uniqueKey));
    
    return lessonOptions.filter(option => 
      !selectedKeys.has(option.uniqueKey) &&
      option.displayText.toLowerCase().includes(recordedInputValue.toLowerCase())
    );
  }, [recordedInputValue, lessonOptions, selectedLessons]);

  const openSelect = useCallback(() => setIsOpen(true), []);
  const closeSelect = useCallback(() => setIsOpen(false), []);

  const handleRecordedInputValueChange = useCallback((newInputValue: string) => {
    setRecordedInputValue(newInputValue || '');
  }, []);

  const handleLessonSelect = useCallback((option: LessonOption | null) => {
    if (option) {
      setSelectedLessons(prev => [...prev, option]);
      setRecordedInputValue('');
    }
  }, []);

  const removeLessonOption = useCallback((uniqueKey: string) => {
    setSelectedLessons(prev => prev.filter(lesson => lesson.uniqueKey !== uniqueKey));
  }, []);

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

  const renderDropdown: ChildrenFunction<LessonOption> = ({
    getLabelProps,
    getInputProps,
    getItemProps,
    getMenuProps,
    highlightedIndex,
  }) => {
    const showResults = isOpen && filteredOptions.length > 0;
    const showNoResultMessage = isOpen && recordedInputValue && !filteredOptions.length;

    return (
      <div className={selectStyles.container}>
        <label className="sr-only" {...getLabelProps()}>
          Select recorded lessons
        </label>
        <input
          {...getInputProps({
            className: classnames(selectStyles.input),
            placeholder: "Add recorded lessons (e.g., XXXX Lecture)",
            onFocus: openSelect,
            style: { fontSize: '1rem' }
          })}
        />
        {showResults && (
          <ol className={selectStyles.selectList} {...getMenuProps()}>
            {filteredOptions.map((option, index) => (
              <li
                {...getItemProps({
                  index,
                  key: option.uniqueKey,
                  item: option,
                })}
                className={classnames(selectStyles.option, {
                  [selectStyles.optionSelected]: highlightedIndex === index,
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span 
                    className={`color-${option.colorIndex}`}
                    style={{
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      borderRadius: '25%',
                      marginRight: '8px',
                      border: 'none',
                    }} 
                  />
                  {option.displayText}
                </div>
              </li>
            ))}
          </ol>
        )}
        {showNoResultMessage && (
          <div className={selectStyles.tip}>
            No lessons found for{' '}
            <strong>"{recordedInputValue}"</strong>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column"}}>
        <div style={{ fontFamily: "monospace", fontSize: "1.2rem", fontWeight: "bold", color:"#ff5138", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Cpu size={25} style={{ color: "#ff5138" }} />
          Timetable Optimiser
        </div>
        <div style={{ color:"GrayText", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "0.1rem", marginTop: "0.5rem"}}>
            <div>
                Intelligently explores millions of combinations to instantly generate an ideal timetable — tailored to your
            </div>
            <div>
                preferred <b>free days, optimal class timings, comfortable lunch breaks, and minimal travel between classes</b>.
            </div>
        </div>
        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column"}}>
            <div style={{fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem"}}>
                Select lessons that are recorded in your timetable
                <Tooltip 
                    content="Choose only those recorded lessons that you're comfortable watching at your convenience"
                    placement="right"
                >
                    <Info className={`${styles.tag}`} size={15} style={{ color: "#69707a" }} />
                </Tooltip>
            </div>
            
            <Downshift
              isOpen={isOpen}
              onOuterClick={closeSelect}
              inputValue={recordedInputValue}
              onChange={handleLessonSelect}
              onInputValueChange={handleRecordedInputValueChange}
              selectedItem={null}
            >
              {renderDropdown}
            </Downshift>

            {/* Selected Lessons Tags */}
            {selectedLessons.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ fontSize: "0.9rem", color: "#69707a", marginBottom: "0.5rem" }}>
                  Selected recorded lessons:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {selectedLessons.map((lesson) => (
                    <span
                      key={lesson.uniqueKey}
                      className={`color-${lesson.colorIndex} ${styles.lessonTag} ${styles.tag}`}
                    >
                      <div style={{fontWeight: "bold"}}>{lesson.displayText}</div>
                      <button
                        type="button"
                        onClick={() => removeLessonOption(lesson.uniqueKey)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.15rem",
                          display: "flex",
                          alignItems: "center",
                          color: "inherit",
                          opacity: 0.8,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                      >
                        <Tooltip content={`Remove ${lesson.displayText}`} placement="top">
                            <X size={18} />
                        </Tooltip>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
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
                                fontSize: "1rem",
                                border: "1px solid #ff5138",
                                borderRadius: "0.25rem",
                                backgroundColor: "transparent",
                                color: "inherit",
                                outline: "none"
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
                                fontSize: "1rem",
                                border: "1px solid #ff5138",
                                borderRadius: "0.25rem",
                                backgroundColor: "transparent",
                                color: "inherit",
                                outline: "none"
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
                            style={{width: "5rem", padding: "0.25rem 0.75rem", fontSize: "1rem", border: "1px solid #ff5138", borderRadius: "0.25rem", backgroundColor: "transparent", color: "inherit", outline: "none"}}
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
                            style={{width: "5rem", padding: "0.25rem 0.75rem", fontSize: "1rem", border: "1px solid #ff5138", borderRadius: "0.25rem", backgroundColor: "transparent", color: "inherit", outline: "none"}}
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
            <div style={{marginTop: "2rem", display: "flex", flexDirection: "row", gap: "3rem", flexWrap: "wrap"}}>
                    
            </div>
        </div>
    </div>
  );
};

export default OptimiserContent;