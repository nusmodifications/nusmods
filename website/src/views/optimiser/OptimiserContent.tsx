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
  const [earliestTime, setEarliestTime] = useState<string>('08');
  const [latestTime, setLatestTime] = useState<string>('19');
  const [earliestLunchTime, setEarliestLunchTime] = useState<string>('12');
  const [latestLunchTime, setLatestLunchTime] = useState<string>('14');
  const [freeDayConflicts, setFreeDayConflicts] = useState<FreeDayConflict[]>([]);
  const [unAssignedLessons, setUnAssignedLessons] = useState<LessonOption[]>([]);
  const [shareableLink, setShareableLink] = useState<string>('');

  // Generate lesson options from current timetable
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

    setFreeDayConflicts(conflicts);
  }, [selectedFreeDays, lessonDaysData, recordings]);

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
