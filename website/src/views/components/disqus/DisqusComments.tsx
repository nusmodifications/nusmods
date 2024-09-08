import { PureComponent, useCallback, useEffect, useRef, useState } from 'react';
import useMutationObserver from 'beautiful-react-hooks/useMutationObserver';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { MessageSquare } from 'react-feather';
import { ColorSchemePreference } from 'types/settings';
import config from 'config';
import { DisqusConfig } from 'types/views';
import insertScript from 'utils/insertScript';
import { getScriptErrorHandler } from 'utils/error';
import { State as StoreState } from 'types/state';
import styles from './DisqusComments.scss';

type Props = DisqusConfig & {
  // Disqus autodetects page background color so that its own font color has
  // enough contrast to be read, but only when the widget is loaded, so we use
  // this to reload the widget after night mode is activated or deactivated
  colorScheme: ColorSchemePreference;

  loadDisqusManually: boolean;
};

type State = {
  allowDisqus: boolean;
};

const SCRIPT_ID = 'dsq-embed-scr';

// Convert the DisqusComments component to functional component.
function DisqusComments({
  loadDisqusManually,
  colorScheme,
  identifier,
  url,
  title,
}: Props): JSX.Element {
  const [allowDisqus, setAllowDisqus] = useState(false);
  const isFirstRender = useRef(true);
  const mutationRef = useRef<HTMLDivElement>(null);
  useMutationObserver(mutationRef, (mutations) => {
    const disqus = mutationRef.current;
    if (disqus === null) return;
    mutations.forEach(() => {
      const iframes = disqus.getElementsByTagName('iframe');
      if (iframes.length > 1) {
        const commentsIframe = iframes[1];
        while (disqus.firstChild) {
          disqus.removeChild(disqus.firstChild);
        }
        disqus.appendChild(commentsIframe);
      }
    });
  });

  const getDisqusConfig = useCallback(
    () =>
      // Disqus is configured using a function that modifies 'this', so we cannot use
      // arrow functions here, which also means we need to rebind values from the outer
      // this if we need to use them inside the function

      // Can't be arsed to type this bullshit
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function configDisqus(this: any) {
        /* eslint-disable react/no-this-in-sfc */
        this.page.identifier = identifier;
        this.page.url = url;
        this.page.title = title;
        /* eslint-enable react/no-this-in-sfc */
      },
    [identifier, url, title],
  );

  const loadInstance = useCallback(() => {
    if (loadDisqusManually && !allowDisqus) return;

    if (window.DISQUS) {
      // See https://help.disqus.com/customer/portal/articles/472107
      window.DISQUS.reset({
        reload: true,
        config: getDisqusConfig(),
      });
    } else {
      // Inject the Disqus script if we're loading it for the first time, ie. when
      // window.DISQUS is not set
      window.disqus_config = getDisqusConfig(); // eslint-disable-line camelcase
      window.disqus_shortname = config.disqusShortname; // eslint-disable-line camelcase

      insertScript(`https://${config.disqusShortname}.disqus.com/embed.js`, {
        id: SCRIPT_ID,
        async: true,
      }).catch(getScriptErrorHandler('Disqus comments'));
    }
  }, [allowDisqus, getDisqusConfig, loadDisqusManually]);

  useEffect(() => {
    // Wait a bit for the page colors to change before reloading instance
    // 2 second delay is found empirically, and is longer than necessary to
    // account for lag in slower user agents
    if (isFirstRender.current) {
      loadInstance();
      isFirstRender.current = false;
    } else {
      setTimeout(loadInstance, 2000);
    }
  }, [loadInstance, colorScheme]);

  if (loadDisqusManually && !allowDisqus) {
    return (
      <div className="text-center">
        <button
          type="button"
          onClick={() => setAllowDisqus(true)}
          className={classnames(styles.loadDisqusBtn, 'btn btn-lg btn-outline-primary')}
        >
          <MessageSquare />
          Load Disqus Comments
        </button>
      </div>
    );
  }

  return <div id="disqus_thread" ref={mutationRef} />;
}

class _DisqusComments extends PureComponent<Props, State> {
  override state = {
    allowDisqus: false,
  };

  override componentDidMount() {
    this.loadInstance();
  }

  override componentDidUpdate(prevProps: Props) {
    // Wait a bit for the page colors to change before reloading instance
    // 2 second delay is found empirically, and is longer than necessary to
    // account for lag in slower user agents
    if (prevProps.colorScheme !== this.props.colorScheme) {
      setTimeout(this.loadInstance, 2000);
    } else {
      this.loadInstance();
    }
  }

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
      window.disqus_config = this.getDisqusConfig(); // eslint-disable-line camelcase
      window.disqus_shortname = config.disqusShortname; // eslint-disable-line camelcase

      insertScript(`https://${config.disqusShortname}.disqus.com/embed.js`, {
        id: SCRIPT_ID,
        async: true,
      }).catch(getScriptErrorHandler('Disqus comments'));
    }
  };

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

  override render() {
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
  colorScheme: state.settings.colorScheme,
}))(DisqusComments);
