// @flow

import React from 'react';
import classnames from 'classnames';
import { Close } from 'views/components/icons';

type Props = {
  onClick: Function,
  className?: string,
};

export default function({ onClick, className }: Props) {
  return (
    <button
      className={classnames('close', className)}
      type="button"
      onClick={onClick}
      aria-label="Close">
      <Close />
    </button>
  );
}
