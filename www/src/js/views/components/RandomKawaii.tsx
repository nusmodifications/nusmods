import * as React from 'react';
import { sample } from 'lodash';
import { SpeechBubble, Mug, Browser, Ghost } from 'react-kawaii';

type Props = {
  size?: number;
  mood?: string | null | undefined;
  color?: string;
  title?: string;
  'aria-label'?: string;
};

const icons = [SpeechBubble, Mug, Browser, Ghost];
const defaultMoods = ['ko', 'sad', 'shocked'];

class RandomKawaii extends React.PureComponent<Props> {
  kawaii: React.ComponentType;
  defaultMood: string;

  static defaultProps = {
    mood: null,
    color: '#FF715D',
  };

  constructor() {
    super();

    this.kawaii = sample(icons);
    this.defaultMood = sample(defaultMoods);
  }

  render() {
    const { size, mood, color, ...wrapperProps } = this.props;
    const Kawaii = this.kawaii;
    const moodProp = mood || this.defaultMood;

    return (
      <div {...wrapperProps}>
        <Kawaii size={size} mood={moodProp} color={color} />
      </div>
    );
  }
}

export default RandomKawaii;
