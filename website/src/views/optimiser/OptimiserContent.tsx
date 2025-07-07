import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getSemesterTimetableColors, getSemesterTimetableLessons } from 'selectors/timetables';
import { State } from 'types/state';
import { ColorMapping } from 'types/reducers';
import { getModuleTimetable } from 'utils/modules';
import { LessonSlot, OptimiseRequest, OptimiseResponse, sendOptimiseRequest } from 'apis/optimiser';
import Title from 'views/components/Title';
import { flatten } from 'lodash';
import ApiError from 'views/errors/ApiError';
import styles from './OptimiserContent.scss';
import OptimiserHeader from './OptimiserHeader';
import OptimiserForm from './OptimiserForm';
import OptimiserButton from './OptimiserButton';
import OptimiserResults from './OptimiserResults';
import { LessonOption, FreeDayConflict } from './types';

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
  const [maxConsecutiveHours, setMaxConsecutiveHours] = useState<number>(4);

  // button
  const [isOptimising, setIsOptimising] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

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

  // Unselected module-lessonType combinations are recorded lessons `module lessonType`
  const recordings = useMemo(() => {
    const selectedKeys = new Set(selectedLessons.map((lesson) => lesson.uniqueKey));
    return lessonOptions
      .filter((lesson) => !selectedKeys.has(lesson.uniqueKey))
      .map((lesson) => lesson.uniqueKey);
  }, [selectedLessons, lessonOptions]);

  // Validate free days against non-recorded lessons
  useEffect(() => {
    const conflicts: FreeDayConflict[] = [];

    // check if all groups are not possible to attend, then it's a conflict, then day of conflict is the days of one of the groups
    // go thorugh each module-lessonType combination, and within that,
    // go through each group and within that check if any of the selected free days are in them, if so, that group is invalid
    lessonGroupsData.forEach((groupMap, uniqueKey) => {
      let validGroups = 0;
      const groupDays = new Set<string>();
      groupMap.forEach((days, _groupName) => {
        if (
          recordings.includes(uniqueKey) || // if it is a recorded lesson, dont trigger a conflict
          !days.some((day) => selectedFreeDays.has(day))
        ) {
          validGroups += 1;
        }
        days.forEach((day) => groupDays.add(day));
      });
      if (selectedFreeDays.size > 0 && validGroups === 0) {
        // check if conflict with the same moduleCode and lessonType already exists, if so, remove the old one and add the new one
        const existingConflict = conflicts.find(
          (conflict) =>
            conflict.moduleCode === uniqueKey.split('-')[0] &&
            conflict.lessonType === uniqueKey.split('-')[1],
        );
        if (existingConflict) {
          conflicts.splice(conflicts.indexOf(existingConflict), 1);
        }
        if (groupDays.has('Saturday')) {
          setHasSaturday(true);
        }
        conflicts.push({
          moduleCode: uniqueKey.split('-')[0],
          lessonType: uniqueKey.split('-')[1],
          displayText: uniqueKey.split('-').join(' '),
          conflictingDays: Array.from(selectedFreeDays).filter((day) => groupDays.has(day)),
        });
      }
    });
    setFreeDayConflicts(conflicts);
  }, [selectedFreeDays, lessonGroupsData, recordings]);

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

  const buttonOnClick = async () => {
    setShareableLink(''); // Reset shareable link
    setIsOptimising(true);
    setError(null);

    const modulesList = Object.keys(timetable);
    const acadYearFormatted = `${acadYear.split('/')[0]}-${acadYear.split('/')[1]}`;

    const params: OptimiseRequest = {
      modules: modulesList,
      acadYear: acadYearFormatted,
      acadSem: activeSemester,
      freeDays: Array.from(selectedFreeDays),
      earliestTime,
      latestTime,
      recordings,
      lunchStart: earliestLunchTime,
      lunchEnd: latestLunchTime,
      maxConsecutiveHours,
    };

    sendOptimiseRequest(params)
      .then(parseData)
      .catch((e) => setError(e))
      .finally(() => setIsOptimising(false));
  };

  const parseData = async (data: OptimiseResponse | null) => {
    const link = data?.shareableLink;
    if (!link) {
      return;
    }
    setShareableLink(link);

    const daySlots = data.DaySlots ?? [];
    const assignedLessons = new Set(
      flatten(daySlots)
        .map((slot: LessonSlot | null) => {
          const lessonKey = slot?.LessonKey;
          if (!lessonKey) {
            return null;
          }
          const [moduleCode, lessonType] = lessonKey.split('|');
          return `${moduleCode} ${lessonType}`;
        })
        .filter((lesson) => !!lesson),
    );

    setUnAssignedLessons(
      lessonOptions.filter((lesson) => !assignedLessons.has(lesson.displayText)),
    );
  };

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
        maxConsecutiveHours={maxConsecutiveHours}
        onToggleLessonSelection={toggleLessonSelection}
        onToggleFreeDay={toggleFreeDay}
        onEarliestTimeChange={setEarliestTime}
        onLatestTimeChange={setLatestTime}
        onEarliestLunchTimeChange={setEarliestLunchTime}
        onLatestLunchTimeChange={setLatestLunchTime}
        onMaxConsecutiveHoursChange={setMaxConsecutiveHours}
      />

      {/* Optimiser button */}
      <OptimiserButton
        freeDayConflicts={freeDayConflicts}
        lessonOptions={lessonOptions}
        isOptimising={isOptimising}
        onClick={buttonOnClick}
      />

      {!!error && (
        <ApiError
          dataName="timetable optimiser"
          promptText="This feature is in Beta, so we would really appreciate your feedback! "
        />
      )}

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
