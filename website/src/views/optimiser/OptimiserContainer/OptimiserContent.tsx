import React, { useState, useMemo, useEffect } from 'react';
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
  getOptimiserAcadYear,
  getRecordedLessonOptions,
  getUnassignedLessonOptions,
  isSaturdayInOptions,
} from 'utils/optimiser';
import { FreeDayConflict, LessonOption } from 'types/optimiser';
import useOptimiserForm from 'views/hooks/useOptimiserForm';
import styles from './OptimiserContent.scss';
import OptimiserHeader from '../OptimiserHeader';
import OptimiserForm from '../OptimiserForm/OptimiserForm';
import OptimiserButton from '../OptimiserButton';
import OptimiserResults from '../OptimiserResults';

const OptimiserContent: React.FC = () => {
  const activeSemester = useSelector(({ app }: State) => app.activeSemester);
  const colors: ColorMapping = useSelector(getSemesterTimetableColors)(activeSemester);
  const timetable: SemTimetableConfig = useSelector(getSemesterTimetableLessons)(activeSemester);
  const modulesMap = useSelector(({ moduleBank }: State) => moduleBank.modules);
  const acadYear = useSelector((state: State) => state.timetables.academicYear);

  const optimiserFormFields = useOptimiserForm();
  const {
    liveLessonOptions: physicalLessonOptions,
    setLiveLessonOptions: setPhysicalLessonOptions,
    freeDays,
    lessonTimeRange,
    lunchTimeRange,
    maxConsecutiveHours,
  } = optimiserFormFields;

  const [unassignedLessons, setUnassignedLessons] = useState<LessonOption[]>([]);
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [defaultShareableLink, setDefaultShareableLink] = useState<string | null>(null);
  const [isOptimising, setIsOptimising] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const lessonOptions = useMemo(() => {
    const modules = getSemesterModules(timetable, modulesMap);
    return getLessonOptions(modules, activeSemester, colors);
  }, [timetable, modulesMap, activeSemester, colors]);

  const freeDayConflicts: FreeDayConflict[] = useMemo(() => {
    const modules = getSemesterModules(timetable, modulesMap);
    return getFreeDayConflicts(modules, activeSemester, physicalLessonOptions, freeDays);
  }, [timetable, modulesMap, activeSemester, physicalLessonOptions, freeDays]);

  const recordedLessonOptions: LessonOption[] = useMemo(
    () => getRecordedLessonOptions(lessonOptions, physicalLessonOptions),
    [lessonOptions, physicalLessonOptions],
  );

  const hasSaturday = useMemo(() => isSaturdayInOptions(lessonOptions), [lessonOptions]);

  useEffect(() => {
    const availableKeys = new Set(lessonOptions.map((option) => option.lessonKey));
    setPhysicalLessonOptions((prev) =>
      prev.filter((lesson) => availableKeys.has(lesson.lessonKey)),
    );
  }, [lessonOptions, setPhysicalLessonOptions]);

  const buttonOnClick = async () => {
    setShareableLink(null);
    setIsOptimising(true);
    setError(null);

    const params: OptimiseRequest = {
      modules: Object.keys(timetable),
      acadYear: getOptimiserAcadYear(acadYear),
      acadSem: activeSemester,
      freeDays: Array.from(freeDays),
      earliestTime: lessonTimeRange.earliest,
      latestTime: lessonTimeRange.latest,
      recordings: recordedLessonOptions.map((lessonOption) => lessonOption.displayText),
      lunchStart: lunchTimeRange.earliest,
      lunchEnd: lunchTimeRange.latest,
      maxConsecutiveHours,
    };

    sendOptimiseRequest(params)
      .then(parseData)
      .catch((e) => {
        setError(e);

        // FIXME: temporarily log errors into the console for beta
        // eslint-disable-next-line no-console
        console.log(e);
      })
      .finally(() => setIsOptimising(false));
  };

  const parseData = async (data: OptimiseResponse | null) => {
    if (!data?.shareableLink) {
      throw new Error('expected shareable link to be created');
    }
    if (!data?.defaultShareableLink) {
      throw new Error('expected default shareable link to be created');
    }
    setShareableLink(data.shareableLink);
    setDefaultShareableLink(data.defaultShareableLink);
    const unassignedLessonOptions = getUnassignedLessonOptions(lessonOptions, data);
    setUnassignedLessons(unassignedLessonOptions);
  };

  return (
    <div className={styles.container}>
      <Title>Optimiser</Title>

      <OptimiserHeader />

      <OptimiserForm
        lessonOptions={lessonOptions}
        freeDayConflicts={freeDayConflicts}
        hasSaturday={hasSaturday}
        optimiserFormFields={optimiserFormFields}
      />

      <OptimiserButton
        isOptimising={isOptimising}
        lessonOptions={lessonOptions}
        freeDayConflicts={freeDayConflicts}
        onClick={buttonOnClick}
      />

      {!!error && (
        <ApiError
          dataName="timetable optimiser"
          promptText="This feature is in Beta, so we would really appreciate your feedback!"
        />
      )}

      <OptimiserResults
        shareableLink={shareableLink}
        defaultShareableLink={defaultShareableLink}
        unassignedLessons={unassignedLessons}
      />
    </div>
  );
};

export default OptimiserContent;
