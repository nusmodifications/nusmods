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

  // button
  const [isOptimising, setIsOptimising] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

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
