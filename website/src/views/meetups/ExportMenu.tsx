import { PureComponent } from 'react';
import Downshift, { ChildrenFunction } from 'downshift';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { ChevronDown, Download, FileText, Image } from 'react-feather';

import { Semester } from 'types/modules';
import { SemTimetableConfig } from 'types/timetables';

import exportApi from 'apis/export';
import { downloadAsIcal } from 'actions/export';
import Online from 'views/components/Online';
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
};

type State = {};

//NOTE: Need to change how export fn works, might not have time to do this
export class ExportMenuComponent extends PureComponent<Props, State> {
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
        </div>
      </div>
    );
  };

  render() {
    return <Downshift onSelect={this.onSelect}>{this.renderDropdown}</Downshift>;
  }
}

export default connect((state: StoreState) => ({ state }), { downloadAsIcal })(ExportMenuComponent);
