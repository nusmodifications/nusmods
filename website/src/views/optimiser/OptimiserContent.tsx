import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getSemesterTimetableColors, getSemesterTimetableLessons } from 'selectors/timetables';
import { State } from 'types/state';
import { ColorMapping } from 'types/reducers';
import { OptimiseRequest, OptimiseResponse, sendOptimiseRequest } from 'apis/optimiser';
import Title from 'views/components/Title';
import ApiError from 'views/errors/ApiError';
import { SemTimetableConfig } from 'types/timetables';
import { getSemesterModules } from 'utils/timetables';
import {
  getFreeDayConflicts,
  getLessonOptions,
  getRecordedLessonOptions,
  getUnassignedLessonOptions,
  isSaturdayInOptions,
} from 'utils/optimiser';
import { FreeDayConflict, LessonOption } from 'types/optimiser';
import { DayText } from 'types/modules';
import styles from './OptimiserContent.scss';
import OptimiserHeader from './OptimiserHeader';
import OptimiserForm from './OptimiserForm';
import OptimiserButton from './OptimiserButton';
import OptimiserResults from './OptimiserResults';

const OptimiserContent: React.FC = () => {
  const activeSemester = useSelector(({ app }: State) => app.activeSemester);
  const colors: ColorMapping = useSelector(getSemesterTimetableColors)(activeSemester);
  const timetable: SemTimetableConfig = useSelector(getSemesterTimetableLessons)(activeSemester);
  const modulesMap = useSelector(({ moduleBank }: State) => moduleBank.modules);
  const acadYear = useSelector((state: State) => state.timetables.academicYear);

  const [selectedLessons, setSelectedLessons] = useState<LessonOption[]>([]);
  const [selectedFreeDays, setSelectedFreeDays] = useState<Set<DayText>>(new Set());
  const [earliestTime, setEarliestTime] = useState<string>('0800');
  const [latestTime, setLatestTime] = useState<string>('1900');
  const [earliestLunchTime, setEarliestLunchTime] = useState<string>('1200');
  const [latestLunchTime, setLatestLunchTime] = useState<string>('1400');
  const [unAssignedLessons, setUnAssignedLessons] = useState<LessonOption[]>([]);
  const [shareableLink, setShareableLink] = useState<string>('');
  const [hasSaturday, setHasSaturday] = useState<boolean>(false);
  const [maxConsecutiveHours, setMaxConsecutiveHours] = useState<number>(4);
  const [isOptimising, setIsOptimising] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const lessonOptions = useMemo(() => {
    const modules = getSemesterModules(timetable, modulesMap);
    return getLessonOptions(modules, activeSemester, colors);
  }, [timetable, modulesMap, activeSemester, colors]);

  const recordedLessonOptions: LessonOption[] = useMemo(
    () => getRecordedLessonOptions(lessonOptions, selectedLessons),
    [lessonOptions, selectedLessons],
  );

  const freeDayConflicts: FreeDayConflict[] = useMemo(() => {
    const modules = getSemesterModules(timetable, modulesMap);
    return getFreeDayConflicts(modules, activeSemester, selectedLessons, selectedFreeDays);
  }, [timetable, modulesMap, activeSemester, selectedLessons, selectedFreeDays]);

  useEffect(() => {
    const availableKeys = new Set(lessonOptions.map((option) => option.lessonKey));
    setSelectedLessons((prev) => prev.filter((lesson) => availableKeys.has(lesson.lessonKey)));
    setHasSaturday(isSaturdayInOptions(lessonOptions));
  }, [lessonOptions]);

  const toggleLessonSelection = useCallback(
    (option: LessonOption) => {
      const isSelected = selectedLessons.some((lesson) => lesson.lessonKey === option.lessonKey);

      if (isSelected) {
        setSelectedLessons((prev) =>
          prev.filter((lesson) => lesson.lessonKey !== option.lessonKey),
        );
      } else {
        setSelectedLessons((prev) => [...prev, option]);
      }
    },
    [selectedLessons],
  );

  const toggleFreeDay = useCallback((day: DayText) => {
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
    const recordings = recordedLessonOptions.map((lessonOption) => lessonOption.displayText);

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

    const unassignedLessonOptions = getUnassignedLessonOptions(lessonOptions, data);
    setUnAssignedLessons(unassignedLessonOptions);
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
