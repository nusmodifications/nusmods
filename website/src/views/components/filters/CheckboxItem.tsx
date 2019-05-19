import React from 'react';
import { ItemProps } from 'searchkit';
import classnames from 'classnames';
import styles from './styles.scss';

type Props = Pick<
  ItemProps,
  'active' | 'count' | 'disabled' | 'itemKey' | 'label' | 'showCount' | 'onClick'
>;

const CheckboxItem = ({ active, count, disabled, itemKey, label, showCount, onClick }: Props) => {
  return (
    <li key={itemKey} className={classnames(styles.label, 'form-check')}>
      <input
        id={itemKey}
        className="form-check-input"
        type="checkbox"
        checked={active}
        onChange={(e) => onClick(e)}
      />

      <label
        htmlFor={itemKey}
        className={classnames('form-check-label', {
          [styles.enabled]: !disabled,
        })}
      >
        {label}
        {showCount && typeof count !== 'undefined' && (
          <>
            &nbsp;
            <span className="text-muted">({count})</span>{' '}
          </>
        )}
      </label>
    </li>
  );
};

export default CheckboxItem;
