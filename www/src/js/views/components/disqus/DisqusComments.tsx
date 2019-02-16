import { DisqusConfig } from 'types/views';
import * as React from 'react';
import { connect } from 'react-redux';

import { Mode } from 'types/settings';
import { State } from 'reducers';
import config from 'config';
import insertScript from 'utils/insertScript';
import { getScriptErrorHandler } from 'utils/error';

type Props = DisqusConfig & {
  // Disqus autodetects page background color so that its own font color has
  // enough contrast to be read, but only when the widget is loaded, so we use
  // this to force the widget after night mode is activated or deactivated
  mode: Mode;
};

const SCRIPT_ID = 'dsq-embed-scr';

class DisqusComments extends React.PureComponent<Props> {
  componentDidMount() {
    this.loadInstance();
  }

  componentDidUpdate(prevProps: Props) {
    // Wait a bit for the page colors to change before reloading instance
    // 2 second delay is found empirically, and is longer than necessary to
    // account for lag is slower user agents
    if (prevProps.mode !== this.props.mode) {
      setTimeout(this.loadInstance, 2000);
    } else {
      this.loadInstance();
    }
  }

  /* eslint-disable @typescript-eslint/camelcase */

  loadInstance = () => {
    if (window.DISQUS) {
      // See https://help.disqus.com/customer/portal/articles/472107
      window.DISQUS.reset({
        reload: true,
        config: this.getDisqusConfig(),
      });
    } else {
      // Inject the Disqus script if we're loading it for the first time, ie. when
      // window.DISQUS is not set
      window.disqus_config = this.getDisqusConfig();
      window.disqus_shortname = config.disqusShortname;

      insertScript(`https://${config.disqusShortname}.disqus.com/embed.js`, {
        id: SCRIPT_ID,
        async: true,
      }).catch(getScriptErrorHandler('Disqus comments'));
    }
  };

  /* eslint-enable */

  getDisqusConfig() {
    // Disqus is configured using a function that modifies 'this', so we cannot use
    // arrow functions here, which also means we need to rebind values from the outer
    // this if we need to use them inside the function
    const { identifier, url, title } = this.props;

    // Can't be arsed to type this bullshit
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function configDisqus(this: any) {
      this.page.identifier = identifier;
      this.page.url = url;
      this.page.title = title;
    };
  }

  render() {
    return <div id="disqus_thread" />;
  }
}

export default connect((state: State) => ({
  mode: state.settings.mode,
}))(DisqusComments);
