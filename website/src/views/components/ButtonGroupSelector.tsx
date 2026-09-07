import * as React from 'react';
import classnames from 'classnames';
import { ToggleGroup, ToggleGroupItem } from 'components/ui/toggle-group';

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
      <ToggleGroupItem
        key={choice}
        type="button"
        className={classnames(...className)}
        {...attr}
        value={choice}
      >
        {choice}
      </ToggleGroupItem>
    );
  });

  return (
    <ToggleGroup
      type="single"
      value={selectedChoice || ''}
      onValueChange={(choice) => {
        if (choice) onChoiceSelect(choice);
      }}
      className={classnames(sizeClassName)}
      aria-label={ariaLabel}
    >
      {buttons}
    </ToggleGroup>
  );
};

export default ButtonGroupSelector;
