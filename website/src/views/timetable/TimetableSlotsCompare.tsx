import { FC, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classnames from 'classnames';
import { X } from 'react-feather';
import { omit } from 'lodash-es';

import type { Semester } from 'types/modules';
import type { ModulesMap, TimetableSlot, TimetableSlotData } from 'types/reducers';
import type { ColoredLesson } from 'types/timetables';
import type { State } from 'types/state';

import { fetchTimetableModules, switchTimetableSlot } from 'actions/timetables';
import { getActiveSlotId, getSlotTimetableData, getTimetableSlots } from 'selectors/timetables';
import {
  arrangeLessonsForWeek,
  hydrateSemTimetableWithLessons,
  timetableLessonsArray,
} from 'utils/timetables';
import { fillColorMapping } from 'utils/colors';

import Timetable from './Timetable';
import styles from './TimetableSlotsCompare.scss';

type PaneIndex = 0 | 1;

type PaneProps = {
  semester: Semester;
  slotId: string;
  pane: PaneIndex;
  slots: TimetableSlot[];
  data: TimetableSlotData;
  modules: ModulesMap;
  isActive: boolean;
  onSelectSlot: (pane: PaneIndex, slotId: string) => void;
  onUseSlot: (slotId: string) => void;
};

const ComparePane: FC<PaneProps> = ({
  semester,
  slotId,
  pane,
  slots,
  data,
  modules,
  isActive,
  onSelectSlot,
  onUseSlot,
}) => {
  const arrangedLessons = useMemo(() => {
    // Hidden modules are excluded from the grid, matching the main timetable
    const visibleConfig = omit(data.lessons, data.hidden);
    const withLessons = hydrateSemTimetableWithLessons(visibleConfig, modules, semester);
    const colors = fillColorMapping(data.lessons, data.colors);
    const coloredLessons: ColoredLesson[] = timetableLessonsArray(withLessons).map((lesson) => ({
      ...lesson,
      colorIndex: colors[lesson.moduleCode],
    }));
    return arrangeLessonsForWeek(coloredLessons);
  }, [data, modules, semester]);

  const moduleCount = Object.keys(data.lessons).length;

  return (
    <div className={styles.pane}>
      <div className={styles.paneHeader}>
        <select
          className="form-control"
          aria-label={`Timetable for pane ${pane + 1}`}
          value={slotId}
          onChange={(evt) => onSelectSlot(pane, evt.target.value)}
        >
          {slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.title}
            </option>
          ))}
        </select>

        <span className={styles.moduleCount}>
          {moduleCount} {moduleCount === 1 ? 'course' : 'courses'}
        </span>

        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          disabled={isActive}
          onClick={() => onUseSlot(slotId)}
        >
          {isActive ? 'Current timetable' : 'Use this timetable'}
        </button>
      </div>

      <div className={classnames(styles.grid, 'verticalMode')}>
        <Timetable lessons={arrangedLessons} isVerticalOrientation />
      </div>
    </div>
  );
};

type Props = {
  semester: Semester;
  slotIds: [string, string];
  onSelectSlot: (pane: PaneIndex, slotId: string) => void;
  onExit: () => void;
};

/**
 * Side-by-side comparison of two saved timetable arrangements.
 * See https://github.com/nusmodifications/nusmods/issues/4455
 */
const TimetableSlotsCompare: FC<Props> = ({ semester, slotIds, onSelectSlot, onExit }) => {
  const dispatch = useDispatch();

  const slots = useSelector(getTimetableSlots)(semester);
  const activeSlotId = useSelector(getActiveSlotId)(semester);
  const getSlotData = useSelector(getSlotTimetableData);
  const modules = useSelector(({ moduleBank }: State) => moduleBank.modules);

  const [slotIdA, slotIdB] = slotIds;
  const dataA = getSlotData(semester, slotIdA);
  const dataB = getSlotData(semester, slotIdB);

  // Inactive slots may reference modules that have been evicted from the
  // module bank, so fetch them before hydrating
  useEffect(() => {
    dispatch(fetchTimetableModules([dataA.lessons, dataB.lessons]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, semester, slotIdA, slotIdB]);

  const useSlot = (slotId: string) => {
    dispatch(switchTimetableSlot(semester, slotId));
    onExit();
  };

  return (
    <div className={styles.compare}>
      <div className={styles.compareHeader}>
        <h2>Compare timetables</h2>
        <button
          type="button"
          className="btn btn-outline-primary btn-svg"
          onClick={onExit}
          aria-label="Exit comparison"
        >
          <X className="svg svg-small" />
          Exit comparison
        </button>
      </div>

      <div className="row">
        {([0, 1] as const).map((pane) => (
          <div className="col-md-6" key={pane}>
            <ComparePane
              semester={semester}
              pane={pane}
              slotId={slotIds[pane]}
              slots={slots}
              data={pane === 0 ? dataA : dataB}
              modules={modules}
              isActive={slotIds[pane] === activeSlotId}
              onSelectSlot={onSelectSlot}
              onUseSlot={useSlot}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableSlotsCompare;
