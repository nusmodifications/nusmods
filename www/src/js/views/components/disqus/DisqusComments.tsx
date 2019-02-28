import { DisqusConfig } from 'types/views';
import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { Mode } from 'types/settings';
import { State as StoreState } from 'reducers';
import config from 'config';
import { MessageSquare } from 'views/components/icons';
import insertScript from 'utils/insertScript';
import { getScriptErrorHandler } from 'utils/error';
import styles from './DisqusComments.scss';

type Props = DisqusConfig & {
  // Disqus autodetects page background color so that its own font color has
  // enough contrast to be read, but only when the widget is loaded, so we use
  // this to force the widget after night mode is activated or deactivated
  mode: Mode;

  loadDisqusManually: boolean;
};

type State = {
  allowDisqus: boolean;
};

const SCRIPT_ID = 'dsq-embed-scr';

class DisqusComments extends React.PureComponent<Props, State> {
  state = {
    allowDisqus: false,
  };
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
    if (this.props.loadDisqusManually && !this.state.allowDisqus) return;

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
    if (this.props.loadDisqusManually && !this.state.allowDisqus) {
      return (
        <div className="text-center">
          <button
            type="button"
            onClick={() => this.setState({ allowDisqus: true })}
            className={classnames(styles.loadDisqusBtn, 'btn btn-lg btn-outline-primary')}
          >
            <MessageSquare />
            Load Disqus Comments
          </button>
        </div>
      );
    }

    return <div id="disqus_thread" />;
  }
}

export default connect((state: StoreState) => ({
  loadDisqusManually: state.settings.loadDisqusManually,
  mode: state.settings.mode,
}))(DisqusComments);
