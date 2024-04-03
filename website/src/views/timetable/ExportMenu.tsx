import { useCallback, useState } from 'react';
import Downshift, { ChildrenFunction } from 'downshift';
import { useDispatch, useSelector } from 'react-redux';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { AlertTriangle, Calendar, ChevronDown, Download, FileText, Image } from 'react-feather';

import { Semester } from 'types/modules';
import { SemTimetableConfig } from 'types/timetables';

import exportApi from 'apis/export';
import { downloadAsIcal, SUPPORTS_DOWNLOAD } from 'actions/export';
import Online from 'views/components/Online';
import Modal from 'views/components/Modal';
import ComponentMap from 'utils/ComponentMap';
import { Counter } from 'utils/react';
import { State } from 'types/state';

import styles from './ExportMenu.scss';

type ExportAction = 'CALENDAR' | 'IMAGE' | 'PDF';
const CALENDAR: ExportAction = 'CALENDAR';
const IMAGE: ExportAction = 'IMAGE';
const PDF: ExportAction = 'PDF';

type Props = {
  semester: Semester;
  timetable: SemTimetableConfig;
};

const ExportMenuComponent: React.FC<Props> = ({ semester, timetable }) => {
  const [isMacWarningOpen, setIsMacWarningOpen] = useState(false);

  const dispatch = useDispatch();
  const state = useSelector((storeState: State) => storeState);

  const onSelect = useCallback(
    (item: ExportAction | null) => {
      if (item === CALENDAR) {
        dispatch(downloadAsIcal(semester));

        // macOS calendar client has a ridiculous bug where it would sometimes disregard
        // EXDATE statements which causes events to show up during holidays, recess week, etc.
        if (navigator.platform === 'MacIntel') {
          setIsMacWarningOpen(true);
        }
      }
    },
    [semester, dispatch],
  );

  const closeMacOSWarningModal = useCallback(
    () => setIsMacWarningOpen(false),
    [setIsMacWarningOpen],
  );

  const renderDropdown: ChildrenFunction<ExportAction> = useCallback(
    ({ isOpen, getItemProps, getMenuProps, toggleMenu, highlightedIndex }) => {
      const counter = new Counter();

      return (
        <div className={styles.exportMenu}>
          <button
            ref={(r) => {
              ComponentMap.downloadButton = r;
            }}
            className={classnames(styles.toggle, 'btn btn-outline-primary btn-svg')}
            type="button"
            onClick={() => toggleMenu()}
          >
            <Download className="svg svg-small" />
            Download
            <ChevronDown className={classnames(styles.chevron, 'svg-small')} />
          </button>

          <div
            className={classnames('dropdown-menu', styles.dropdownMenu, { show: isOpen })}
            {...getMenuProps()}
          >
            <Online>
              <a
                href={exportApi.image(semester, timetable, state, window.devicePixelRatio)}
                className={classnames('dropdown-item', {
                  'dropdown-selected': counter.matches(highlightedIndex),
                })}
                {...getItemProps({ item: IMAGE })}
              >
                <Image className="svg svg-small" /> Image (.png)
              </a>

              <a
                href={exportApi.pdf(semester, timetable, state)}
                className={classnames('dropdown-item', {
                  'dropdown-selected': counter.matches(highlightedIndex),
                })}
                {...getItemProps({ item: PDF })}
              >
                <FileText className="svg svg-small" /> PDF (.pdf)
              </a>
            </Online>

            {SUPPORTS_DOWNLOAD && (
              <button
                className={classnames('dropdown-item', {
                  'dropdown-selected': counter.matches(highlightedIndex),
                })}
                type="button"
                {...getItemProps({ item: CALENDAR })}
              >
                <Calendar className="svg svg-small" />
                iCalendar File (.ics)
                <br />
                (For Google Calendar / Outlook)
              </button>
            )}
          </div>

          <Modal isOpen={isMacWarningOpen} onRequestClose={closeMacOSWarningModal} animate>
            <div className={styles.modalContent}>
              <AlertTriangle />
              <p>The calendar you have just downloaded may not work with the macOS Calendar app.</p>
            </div>
            <div className={styles.modalButtons}>
              <Link to="/faq#mac-calendar" className="btn btn-outline-primary">
                Find out more
              </Link>
              <button type="button" className="btn btn-primary" onClick={closeMacOSWarningModal}>
                Gotcha
              </button>
            </div>
          </Modal>
        </div>
      );
    },
    [isMacWarningOpen, closeMacOSWarningModal, semester, timetable, state],
  );

  return <Downshift onSelect={onSelect}>{renderDropdown}</Downshift>;
};

export default ExportMenuComponent;
