import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import * as React from 'react';
import classnames from 'classnames';
import { NBSP } from 'utils/react';
import styles from './styles.scss';

interface Props {
  onClick: React.ChangeEventHandler<HTMLInputElement>;
  label: string;
  count: number | string;
  active?: boolean;
  disabled?: boolean;
  showCount: boolean;
  itemKey?: string;
}

const CheckboxItem: React.FC<Props> = ({
  active,
  count,
  disabled,
  itemKey,
  label,
  showCount,
  onClick,
}) => (
  <li key={itemKey} className={classnames(styles.label, 'form-check')}>
    <Input
      id={itemKey}
      className="form-check-input"
      type="checkbox"
      checked={active}
      onChange={(e) => onClick(e)}
    />

    <Label
      htmlFor={itemKey}
      className={classnames('form-check-label', {
        [styles.enabled]: !disabled,
      })}
    >
      {label}
      {showCount && typeof count !== 'undefined' && (
        <>
          {NBSP}
          <span className="text-muted">({count})</span>{' '}
        </>
      )}
    </Label>
  </li>
);

export default CheckboxItem;
