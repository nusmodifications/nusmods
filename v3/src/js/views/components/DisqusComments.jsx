// @flow

import React, { PureComponent } from 'react';
import config from 'config';

type Props = {
  url: string,
  identifier: string,
  title: string,
};

const SCRIPT_ID = 'dsq-embed-scr';

export default class DisqusComments extends PureComponent<Props> {
  componentDidMount() {
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

      const script = document.createElement('script');
      script.src = `https://${config.disqusShortname}.disqus.com/embed.js`;
      script.id = SCRIPT_ID;
      script.async = true;

      if (document.body) {
        document.body.appendChild(script);
      }
    }
  }

  getDisqusConfig() {
    // Disqus is configured using a function that modifies 'this', so we cannot use
    // arrow functions here, which also means we need to rebind values from the outer
    // this if we need to use them inside the function
    const props = this.props;

    return function configDisqus() {
      this.page.identifier = props.identifier;
      this.page.url = props.url;
      this.page.title = props.title;
    };
  }

  render() {
    return <div id="disqus_thread" />;
  }
}
