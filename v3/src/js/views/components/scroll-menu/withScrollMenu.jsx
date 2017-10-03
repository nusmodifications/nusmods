// @flow

import type { ComponentType } from 'react';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getDisplayName } from 'utils/react';

export default function withScrollMenu<Props>(WrappedComponent: ComponentType<Props>) {
  return class extends Component<Props> {
    componentDidMount() {
    }

    static displayName = getDisplayName(WrappedComponent);

    static contextTypes = {
      menuId: PropTypes.string.isRequired,
      setInitialPosition: PropTypes.func.isRequired,
    };

    render() {
      return (
        <WrappedComponent
          {...this.context}
          {...this.props}
        />
      );
    }
  };
}
