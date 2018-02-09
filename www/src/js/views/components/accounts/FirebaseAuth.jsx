// Original file obtained from
// https://github.com/firebase/firebaseui-web-react/blob/03b46335695452d1e3718778c8fa7d4a1218def7/src/FirebaseAuth.jsx
// Modified for our use as it required a CSS file which could not be easily transpiled with Webpack

/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// @flow

import React from 'react';
import firebaseui from 'firebaseui';
import 'styles/firebase.scss';

// Global ID for the element.
const ELEMENT_ID = 'firebaseui_container';

/**
 * Properties types.
 */
type Props = {
  uiConfig: Object, // The Firebase UI Web UI Config object.
  // See: https://github.com/firebase/firebaseui-web#configuration
  firebaseAuth: Object, // The Firebase App auth instance to use.
  elementId: string, // The ID of the underlying container that we'll generate.
  // Use this if you use more than one instance at a time in your app.
  className?: string,
};

/**
 * React Component wrapper for the FirebaseUI Auth widget.
 */
export default class FirebaseAuth extends React.Component<Props> {
  firebaseUiWidget: firebaseui.auth.AuthUI;

  static defaultProps = {
    elementId: ELEMENT_ID,
  };

  componentDidMount() {
    const { firebaseAuth, uiConfig, elementId } = this.props;
    this.firebaseUiWidget =
      firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebaseAuth);
    if (uiConfig.signInFlow === 'popup') {
      this.firebaseUiWidget.reset();
    }
    this.firebaseUiWidget.start(`#${elementId}`, uiConfig);
  }

  componentWillUnmount() {
    if (this.firebaseUiWidget) {
      this.firebaseUiWidget.reset();
    }
  }

  render() {
    const { className, elementId } = this.props;
    return <div className={className} id={elementId} />;
  }
}
