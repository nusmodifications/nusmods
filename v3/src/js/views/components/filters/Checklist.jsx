// @flow

import React from 'react';
import classnames from 'classnames';
import ModuleFilter from 'utils/filters/ModuleFilter';
import styles from './styles.scss';

type Props = {
  filters: ModuleFilter[],
  onChange: ModuleFilter => void,
  getCount: ModuleFilter => number,
};

export default function({ filters, onChange, getCount }: Props) {
  return (
    <ul className="list-unstyled">
      {filters.map((filter: ModuleFilter) => (
        <li key={filter.label}>
          <label
            className={classnames('form-check-label', styles.label, {
              [styles.enabled]: filter.enabled,
            })}>
            <input
              className="form-check-input"
              type="checkbox"
              checked={filter.enabled}
              onChange={() => onChange(filter)}
            />
            {filter.label}&nbsp;<span className="text-muted">({getCount(filter)})</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
