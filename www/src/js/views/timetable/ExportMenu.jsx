// @flow

import React, { PureComponent } from 'react';
import Downshift from 'downshift';
import { connect } from 'react-redux';
import classnames from 'classnames';

import type { State } from 'reducers';
import type { Semester } from 'types/modules';
import exportApi from 'apis/export';
import { downloadAsIcal, SUPPORTS_DOWNLOAD } from 'actions/export';
import { Image, Calendar, FileText, Upload, ChevronDown } from 'views/components/icons';

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
    const { semester, state } = this.props;

    switch (item) {
      case CALENDAR:
        this.props.downloadAsIcal(semester);
        return;
      case PDF:
        window.open(exportApi.pdf(semester, state), '_blank');
        return;
      case IMAGE:
      default:
        window.open(exportApi.image(semester, state), '_blank');
    }
  };

  render() {
    return (
      <Downshift
        onChange={this.onChange}
        render={({ isOpen, getItemProps, toggleMenu }) => (
          <div className={styles.exportMenu}>
            <button
              className={classnames(styles.toggle, 'btn btn-outline-primary btn-svg')}
              type="button"
              onClick={toggleMenu}
            >
              <Upload className="svg svg-small" /> Export
              <ChevronDown className={classnames(styles.chevron, 'svg-small')} />
            </button>
            {isOpen && (
              <div className={classnames('dropdown-menu show', styles.dropdownMenu)}>
                {SUPPORTS_DOWNLOAD && (
                  <button
                    className="dropdown-item"
                    type="button"
                    {...getItemProps({ item: CALENDAR })}
                  >
                    <Calendar className="svg svg-small" />iCalendar File (.ics)<br />
                    (For Google Calendar / Outlook)
                  </button>
                )}

                <button className="dropdown-item" type="button" {...getItemProps({ item: PDF })}>
                  <FileText className="svg svg-small" /> PDF (.pdf)
                </button>

                <button className="dropdown-item" type="button" {...getItemProps({ item: IMAGE })}>
                  <Image className="svg svg-small" /> Image (.png)
                </button>
              </div>
            )}
          </div>
        )}
      />
    );
  }
}

export default connect((state) => ({ state }), { downloadAsIcal })(ExportMenuComponent);
