// @flow
import React from 'react';
import classnames from 'classnames';

type ButtonChoice = string;
type Props = {
  choices: ButtonChoice[],
  attrs?: { [ButtonChoice]: Object },
  classNames?: { [ButtonChoice]: string[] },
  size?: string,
  selectedChoice: ?ButtonChoice,
  onChoiceSelect: (string) => void,
  ariaLabel?: string,
};

export default function ButtonGroupSelector(props: Props) {
  const {
    size,
    choices,
    selectedChoice,
    onChoiceSelect,
    classNames = {},
    attrs = {},
    ariaLabel = 'Choices',
  } = props;

  const sizeClassName = size ? `btn-group-${size}` : null;

  const buttons = choices.map((choice) => {
    const attr = attrs[choice] || {};
    const className = classNames[choice] || [];

    return (
      <button
        {...attr}
        key={choice}
        onClick={() => onChoiceSelect(choice)}
        type="button"
        className={classnames('btn', ...className, {
          'btn-primary': selectedChoice === choice,
          'btn-outline-primary': selectedChoice !== choice,
        })}
      >
        {choice}
      </button>
    );
  });

  return (
    <div className={classnames('btn-group', sizeClassName)} role="group" aria-label={ariaLabel}>
      {buttons}
    </div>
  );
}
