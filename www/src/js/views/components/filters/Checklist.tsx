import * as React from 'react';
import classnames from 'classnames';
import ModuleFilter from 'utils/filters/ModuleFilter';
import styles from './styles.scss';

type Props = {
  // Needed to generate unique ID and labels for checkbox and radio inputs
  groupId: string;
  filters: ModuleFilter[];
  onChange: (moduleFilter: ModuleFilter) => void;
  getCount: (moduleFilter: ModuleFilter) => number;
};

export default function Checklist({ groupId, filters, onChange, getCount }: Props) {
  return (
    <ul className="list-unstyled">
      {filters.map((filter: ModuleFilter) => {
        const id = `${groupId}-${filter.id}`;

        return (
          <li key={filter.label} className={classnames(styles.label, 'form-check')}>
            <input
              id={id}
              className="form-check-input"
              type="checkbox"
              checked={filter.enabled}
              onChange={() => onChange(filter)}
            />

            <label
              htmlFor={id}
              className={classnames('form-check-label', {
                [styles.enabled]: filter.enabled,
              })}
            >
              {filter.label}
              &nbsp;
              <span className="text-muted">({getCount(filter)})</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
