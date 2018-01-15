// @flow

import React, { PureComponent } from 'react';
import Downshift from 'downshift';
import { connect } from 'react-redux';
import classnames from 'classnames';

import type { State } from 'reducers';
import type { Semester } from 'types/modules';

import exportApi from 'apis/export';
import { downloadAsIcal, SUPPORTS_DOWNLOAD } from 'actions/export';
import { Image, Calendar, FileText, Download, ChevronDown } from 'views/components/icons';
import Online from 'views/components/Online';
import { Counter } from 'utils/react';

import styles from './ExportMenu.scss';

type ExportAction = 'CALENDAR' | 'IMAGE' | 'PDF';
const CALENDAR: ExportAction = 'CALENDAR';
const IMAGE: ExportAction = 'IMAGE';
const PDF: ExportAction = 'PDF';

type Props = {
  state: State,
  semester: Semester,
  downloadAsIcal: Semester => void,
};

export class ExportMenuComponent extends PureComponent<Props> {
  onChange = (item: ExportAction) => {
    const { semester } = this.props;
    if (item === CALENDAR) {
      this.props.downloadAsIcal(semester);
    }
  };

  renderDropdown = ({ isOpen, getItemProps, toggleMenu, highlightedIndex }: any) => {
    const { semester, state } = this.props;
    const counter = new Counter();

    return (
      <div className={styles.exportMenu}>
        <button
          className={classnames(styles.toggle, 'btn btn-outline-primary btn-svg')}
          type="button"
          onClick={toggleMenu}
        >
          <Download className="svg svg-small" />Download
          <ChevronDown className={classnames(styles.chevron, 'svg-small')} />
        </button>

        {isOpen && (
          <div className={classnames('dropdown-menu show', styles.dropdownMenu)}>
            <Online>
              <a
                href={exportApi.image(semester, state, window.devicePixelRatio)}
                className={classnames('dropdown-item', {
                  'dropdown-selected': counter.matches(highlightedIndex),
                })}
                {...getItemProps({ item: IMAGE })}
              >
                <Image className="svg svg-small" /> Image (.png)
              </a>

              <a
                href={exportApi.pdf(semester, state)}
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
                <Calendar className="svg svg-small" />iCalendar File (.ics)<br />
                (For Google Calendar / Outlook)
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  render() {
    return <Downshift onChange={this.onChange} render={this.renderDropdown} />;
  }
}

export default connect((state: State) => ({ state }), { downloadAsIcal })(ExportMenuComponent);
