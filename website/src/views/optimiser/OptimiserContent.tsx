import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getSemesterTimetableColors, getSemesterTimetableLessons } from 'selectors/timetables';
import { State } from 'types/state';
import { ColorMapping } from 'types/reducers';
import { getModuleTimetable } from 'utils/modules';
import Title from 'views/components/Title';
import styles from './OptimiserContent.scss';
import OptimiserHeader from './OptimiserHeader';
import OptimiserForm from './OptimiserForm';
import OptimiserButton from './OptimiserButton';
import OptimiserResults from './OptimiserResults';
import { LessonOption, LessonDaysData, FreeDayConflict } from './types';

const OptimiserContent: React.FC = () => {
  const activeSemester = useSelector(({ app }: State) => app.activeSemester);
  const colors: ColorMapping = useSelector(getSemesterTimetableColors)(activeSemester);
  const timetable = useSelector(getSemesterTimetableLessons)(activeSemester);
  const modules = useSelector(({ moduleBank }: State) => moduleBank.modules);
  const acadYear = useSelector((state: State) => state.timetables.academicYear);

  const [selectedLessons, setSelectedLessons] = useState<LessonOption[]>([]);
  const [selectedFreeDays, setSelectedFreeDays] = useState<Set<string>>(new Set());
  const [earliestTime, setEarliestTime] = useState<string>('0800');
  const [latestTime, setLatestTime] = useState<string>('1900');
  const [earliestLunchTime, setEarliestLunchTime] = useState<string>('1200');
  const [latestLunchTime, setLatestLunchTime] = useState<string>('1400');
  const [freeDayConflicts, setFreeDayConflicts] = useState<FreeDayConflict[]>([]);
  const [unAssignedLessons, setUnAssignedLessons] = useState<LessonOption[]>([]);
  const [shareableLink, setShareableLink] = useState<string>('');
  const [hasSaturday, setHasSaturday] = useState<boolean>(false);

  // Generate lesson options from current timetable
  // find the lesson and the type in lessonOptions, and then find the days of that combination in lessonDaysData
  const lessonOptions = useMemo(() => {
    const options: LessonOption[] = [];

    Object.keys(timetable).forEach((moduleCode) => {
      const module = modules[moduleCode];
      if (!module) return;

      const moduleTimetable = getModuleTimetable(module, activeSemester);
      const colorIndex = colors[moduleCode] || 0;

      // Get unique lesson types for this module
      const lessonTypes = Array.from(new Set(moduleTimetable.map((lesson) => lesson.lessonType)));

      lessonTypes.forEach((lessonType) => {
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

  // group by classNo
  const lessonGroupsData = useMemo(() => {
    const moduleGroupMap = new Map<string, Map<string, string[]>>();
    // each item has moduleCode-lessonType, combination, so get all the groups with days for that group
    lessonOptions.forEach((option) => {
      const module = modules[option.moduleCode];
      // get the timetable so that you can get the groups and the days for that group
      const moduleTimetable = getModuleTimetable(module, activeSemester);
      // now get the groups and the days for that group
      // the DS for this is a list of maps, {groupName(string): days(list type)}
      const groupDayMap = new Map<string, string[]>();

      moduleTimetable.forEach((lesson) => {
        if (lesson.lessonType === option.lessonType) {
          if (groupDayMap.has(lesson.classNo)) {
            // find the the item with that key and push the day to the days array
            const days = groupDayMap.get(lesson.classNo) || [];
            days.push(lesson.day);
            groupDayMap.set(lesson.classNo, days);
          } else {
            groupDayMap.set(lesson.classNo, [lesson.day]);
          }
        }
      });
      moduleGroupMap.set(option.uniqueKey, groupDayMap);
      // now you have all the groups for that module-lessonType combination
    });
    return moduleGroupMap;
  }, [lessonOptions, modules, activeSemester]);

  const lessonDaysData = useMemo(() => {
    const lessonDays: LessonDaysData[] = [];

    lessonOptions.forEach((option) => {
      const module = modules[option.moduleCode];
      if (!module) return;

      const moduleTimetable = getModuleTimetable(module, activeSemester);
      const lessonsForType = moduleTimetable.filter(
        (lesson) => lesson.lessonType === option.lessonType,
      );

      const days = new Set<string>();
      lessonsForType.forEach((lesson) => {
        days.add(lesson.day);
      });
      if (days.has('Saturday')) {
        setHasSaturday(true);
      }
      lessonDays.push({
        uniqueKey: option.uniqueKey,
        moduleCode: option.moduleCode,
        lessonType: option.lessonType,
        displayText: option.displayText,
        days,
      });
    });

    return lessonDays;
  }, [lessonOptions, modules, activeSemester]);

  // Unselected module-lessonType combinations are recorded lessons `module lessonType`
  const recordings = useMemo(() => {
    const selectedKeys = new Set(selectedLessons.map((lesson) => lesson.uniqueKey));
    return lessonOptions
      .filter((lesson) => !selectedKeys.has(lesson.uniqueKey))
      .map((lesson) => lesson.displayText);
  }, [selectedLessons, lessonOptions]);

  // Validate free days against non-recorded lessons
  useEffect(() => {
    const recordingsSet = new Set(recordings);
    const conflicts: FreeDayConflict[] = [];

    // Check each non-recorded lesson (physical lessons that user plans to attend)
    lessonDaysData.forEach((lessonData) => {
      // Skip if this lesson is recorded (not attending in person)
      if (recordingsSet.has(lessonData.displayText)) return;

      // Check if ALL days for this lesson are selected as free days
      const lessonDaysArray = Array.from(lessonData.days);
      const conflictingDays = lessonDaysArray.filter((day) => selectedFreeDays.has(day));

      // If all lesson days are selected as free days, it's a conflict
      if (conflictingDays.length === lessonDaysArray.length && conflictingDays.length > 0) {
        conflicts.push({
          moduleCode: lessonData.moduleCode,
          lessonType: lessonData.lessonType,
          displayText: lessonData.displayText,
          conflictingDays,
        });
      }
    });
    // check if all groups are not possible to attend, then it's a conflict, then day of conflict is the days of one of the groups
    // go thorugh each module-lessonType combination, and within that,
    // go through each group and within that check if any of the selected free days are in them, if so, that group is invalid
    lessonGroupsData.forEach((groupMap, uniqueKey) => {
      let validGroups = 0;
      groupMap.forEach((days, groupName) => {
        if (
          recordings.includes(uniqueKey.split('-').join(' ')) || // if it is a recorded lesson, dont trigger a conflict
          !days.some((day) => selectedFreeDays.has(day))
        ) {
          validGroups += 1;
        }
      });
      if (selectedFreeDays.size > 0 && validGroups === 0) {
        conflicts.push({
          moduleCode: uniqueKey.split('-')[0],
          lessonType: uniqueKey.split('-')[1],
          displayText: uniqueKey.split('-').join(' '),
          // the days that are common between selectedFreeDays and the days in the group
          conflictingDays: Array.from(selectedFreeDays),
        });
      }
    });
    setFreeDayConflicts(conflicts);
  }, [selectedFreeDays, lessonDaysData, lessonGroupsData, recordings]);

  useEffect(() => {
    const availableKeys = new Set(lessonOptions.map((option) => option.uniqueKey));
    setSelectedLessons((prev) => prev.filter((lesson) => availableKeys.has(lesson.uniqueKey)));
  }, [lessonOptions]);

  const toggleLessonSelection = useCallback(
    (option: LessonOption) => {
      const isSelected = selectedLessons.some((lesson) => lesson.uniqueKey === option.uniqueKey);

      if (isSelected) {
        setSelectedLessons((prev) =>
          prev.filter((lesson) => lesson.uniqueKey !== option.uniqueKey),
        );
      } else {
        setSelectedLessons((prev) => [...prev, option]);
      }
    },
    [selectedLessons],
  );

  const toggleFreeDay = useCallback((day: string) => {
    setSelectedFreeDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }
      return newSet;
    });
  }, []);

  const openOptimisedTimetable = () => {
    if (shareableLink) {
      window.open(shareableLink, '_blank');
    }
  };

  return (
    <div className={styles.container}>
      <Title>Optimiser</Title>

      {/* Optimiser header */}
      <OptimiserHeader />

      {/*  All the form elements */}
      <OptimiserForm
        lessonOptions={lessonOptions}
        selectedLessons={selectedLessons}
        selectedFreeDays={selectedFreeDays}
        earliestTime={earliestTime}
        latestTime={latestTime}
        earliestLunchTime={earliestLunchTime}
        latestLunchTime={latestLunchTime}
        freeDayConflicts={freeDayConflicts}
        hasSaturday={hasSaturday}
        onToggleLessonSelection={toggleLessonSelection}
        onToggleFreeDay={toggleFreeDay}
        onEarliestTimeChange={setEarliestTime}
        onLatestTimeChange={setLatestTime}
        onEarliestLunchTimeChange={setEarliestLunchTime}
        onLatestLunchTimeChange={setLatestLunchTime}
      />

      {/* Optimiser button */}
      <OptimiserButton
        freeDayConflicts={freeDayConflicts}
        lessonOptions={lessonOptions}
        acadYear={acadYear}
        activeSemester={activeSemester}
        selectedFreeDays={selectedFreeDays}
        earliestTime={earliestTime}
        latestTime={latestTime}
        recordings={recordings}
        earliestLunchTime={earliestLunchTime}
        latestLunchTime={latestLunchTime}
        timetable={timetable}
        setShareableLink={setShareableLink}
        setUnAssignedLessons={setUnAssignedLessons}
      />

      {/* Optimiser results */}
      <OptimiserResults
        shareableLink={shareableLink}
        unAssignedLessons={unAssignedLessons}
        openOptimisedTimetable={openOptimisedTimetable}
      />
    </div>
  );
};

export default OptimiserContent;
