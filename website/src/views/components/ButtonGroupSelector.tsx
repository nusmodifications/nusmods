import * as React from 'react';
import classnames from 'classnames';

export type Props = {
  choices: string[];
  attrs?: { [choice: string]: React.ButtonHTMLAttributes<HTMLButtonElement> };
  classNames?: { [choice: string]: string[] };
  size?: string;
  selectedChoice: string | null;
  onChoiceSelect: (str: string) => void;
  ariaLabel?: string;
};

const ButtonGroupSelector: React.FC<Props> = (props) => {
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
        key={choice}
        onClick={() => onChoiceSelect(choice)}
        type="button"
        className={classnames('btn', ...className, {
          'btn-primary': selectedChoice === choice,
          'btn-outline-primary': selectedChoice !== choice,
        })}
        {...attr}
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
};

export default ButtonGroupSelector;
