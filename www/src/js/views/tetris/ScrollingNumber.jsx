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

    if (currentValue === this.props.children) {
      this.isAnimating = false;
      return;
    }

    this.isAnimating = true;
    let delta;
    if (Math.abs(currentValue - this.props.children) > 100) {
      delta = currentValue < this.props.children ? 5 : -5;
    } else {
      delta = currentValue < this.props.children ? 1 : -1;
    }

    this.setState({ currentValue: currentValue + delta });
    window.requestAnimationFrame(this.onNextFrame);
  };

  isAnimating = false;

  render() {
    const { children, tagName, ...otherProps } = this.props;
    const Tag = tagName;
    return <Tag {...otherProps}>{this.state.currentValue}</Tag>;
  }
}
