import { PureComponent } from 'react';
import Downshift, { ChildrenFunction } from 'downshift';
import { connect } from 'react-redux';
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
import { State as StoreState } from 'types/state';

import styles from './ExportMenu.scss';

type ExportAction = 'CALENDAR' | 'IMAGE' | 'PDF';
const CALENDAR: ExportAction = 'CALENDAR';
const IMAGE: ExportAction = 'IMAGE';
const PDF: ExportAction = 'PDF';

type Props = {
  state: StoreState;
  semester: Semester;
  timetable: SemTimetableConfig;
  downloadAsIcal: (semester: Semester) => void;
};

type State = {
  isMacWarningOpen: boolean;
};

export class ExportMenuComponent extends PureComponent<Props, State> {
  state: State = {
    isMacWarningOpen: false,
  };

  onSelect = (item: ExportAction | null) => {
    if (item === CALENDAR) {
      this.props.downloadAsIcal(this.props.semester);

      // macOS calendar client has a ridiculous bug where it would sometimes disregard
      // EXDATE statements which causes events to show up during holidays, recess week, etc.
      if (navigator.platform === 'MacIntel') {
        this.setState({
          isMacWarningOpen: true,
        });
      }
    }
  };

  closeMacOSWarningModal = () => this.setState({ isMacWarningOpen: false });

  renderDropdown: ChildrenFunction<ExportAction> = ({
    isOpen,
    getItemProps,
    getMenuProps,
    toggleMenu,
    highlightedIndex,
  }) => {
    const { semester, timetable, state } = this.props;
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
              <Image className="dropdown-item-left-icon" />
              Image (.png)
            </a>

            <a
              href={exportApi.pdf(semester, timetable, state)}
              className={classnames('dropdown-item', {
                'dropdown-selected': counter.matches(highlightedIndex),
              })}
              {...getItemProps({ item: PDF })}
            >
              <FileText className="dropdown-item-left-icon" />
              PDF (.pdf)
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
              <Calendar className="dropdown-item-left-icon" />
              <span>
                iCalendar File (.ics)
                <br />
                (For Google Calendar / Outlook)
              </span>
            </button>
          )}
        </div>

        <Modal
          isOpen={this.state.isMacWarningOpen}
          onRequestClose={this.closeMacOSWarningModal}
          animate
        >
          <div className={styles.modalContent}>
            <AlertTriangle />
            <p>The calendar you have just downloaded may not work with the macOS Calendar app.</p>
          </div>
          <div className={styles.modalButtons}>
            <Link to="/faq#mac-calendar" className="btn btn-outline-primary">
              Find out more
            </Link>
            <button type="button" className="btn btn-primary" onClick={this.closeMacOSWarningModal}>
              Gotcha
            </button>
          </div>
        </Modal>
      </div>
    );
  };

  render() {
    return <Downshift onSelect={this.onSelect}>{this.renderDropdown}</Downshift>;
  }
}

export default connect((state: StoreState) => ({ state }), { downloadAsIcal })(ExportMenuComponent);
