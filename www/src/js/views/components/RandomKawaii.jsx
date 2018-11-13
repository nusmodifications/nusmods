// @flow
import React, { PureComponent, type ComponentType } from 'react';
import { Planet, SpeechBubble, Mug, Browser, Ghost } from 'react-kawaii';

type Props = {
  size?: number,
  mood?: string,
  color?: string,
  title?: string,
  'aria-label'?: string,
};

const icons = [Planet, SpeechBubble, Mug, Browser, Ghost];

class RandomKawaii extends PureComponent<Props> {
  kawaii: ComponentType;

  static defaultProps = {
    mood: 'sad',
    color: '#FF715D',
  };

  constructor() {
    super();

    this.kawaii = icons[Math.floor(Math.random() * icons.length)];
  }

  render() {
    const { size, mood, color, ...wrapperProps } = this.props;
    const Kawaii = this.kawaii;

    return (
      <div {...wrapperProps} title={this.props.title}>
        <Kawaii size={size} mood={mood} color={color} />
      </div>
    );
  }
}

export default RandomKawaii;
