// @flow

import React, { PureComponent } from 'react';

type Props = {
  children: number,
  tagName: string,
  className?: string,

  // Additional props
  [string]: any,
};

type State = {|
  currentValue: number,
|};

/**
 * Animates a number such that it increments or decrements (spins) towards
 * the actual value provided as the children
 */
export default class ScrollingNumber extends PureComponent<Props, State> {
  static defaultProps = {
    tagName: 'span',
  };

  state = {
    currentValue: this.props.children,
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.value !== this.state.currentValue && !this.isAnimating) {
      window.requestAnimationFrame(this.onNextFrame);
    }
  }

  onNextFrame = () => {
    const { currentValue } = this.state;
    const targetValue = this.props.children;

    if (currentValue === targetValue) {
      this.isAnimating = false;
      return;
    }

    this.isAnimating = true;

    // Find how much to change based on the difference to the actual value
    const cubicDiff = Math.round((targetValue - currentValue) / 25);
    let delta;
    if (cubicDiff === 0) {
      delta = currentValue < targetValue ? 1 : -1;
    } else {
      delta = cubicDiff;
    }

    this.setState({ currentValue: currentValue + delta });
    window.requestAnimationFrame(this.onNextFrame);
  };

  isAnimating = false;

  render() {
    // Children is ignored since that represents the actual value
    const { children, tagName, ...otherProps } = this.props;
    const Tag = tagName;
    return <Tag {...otherProps}>{this.state.currentValue}</Tag>;
  }
}
