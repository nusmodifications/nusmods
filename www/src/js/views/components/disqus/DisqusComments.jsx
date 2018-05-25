// @flow

import type { DisqusConfig } from 'types/views';
import React, { PureComponent } from 'react';
import config from 'config';
import insertScript from 'utils/insertScript';
import serverSkip from 'views/hocs/serverSkip';

type Props = DisqusConfig;

const SCRIPT_ID = 'dsq-embed-scr';

class DisqusCommentsComponent extends PureComponent<Props> {
  componentDidMount() {
    this.loadInstance();
  }

  componentDidUpdate() {
    this.loadInstance();
  }

  loadInstance() {
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

      insertScript(`https://${config.disqusShortname}.disqus.com/embed.js`, SCRIPT_ID, true);
    }
  }

  getDisqusConfig() {
    // Disqus is configured using a function that modifies 'this', so we cannot use
    // arrow functions here, which also means we need to rebind values from the outer
    // this if we need to use them inside the function
    const { identifier, url, title } = this.props;

    return function configDisqus() {
      this.page.identifier = identifier;
      this.page.url = url;
      this.page.title = title;
    };
  }

  render() {
    return <div id="disqus_thread" />;
  }
}

export default serverSkip(DisqusCommentsComponent);
