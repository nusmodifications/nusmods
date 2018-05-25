// @flow
import type { DisqusConfig } from 'types/views';

import React, { PureComponent } from 'react';
import config from 'config';
import insertScript from 'utils/insertScript';
import { MessageSquare } from 'views/components/icons';
import serverSkip from 'views/hocs/serverSkip';
import styles from './CommentCount.scss';

type Props = DisqusConfig;

const SCRIPT_ID = 'dsq-count-scr';

class CommentCountComponent extends PureComponent<Props> {
  static loadInstance() {
    if (window.DISQUSWIDGETS) {
      window.DISQUSWIDGETS.getCount({
        reset: true,
      });
    } else {
      insertScript(`https://${config.disqusShortname}.disqus.com/count.js`, SCRIPT_ID, true);
    }
  }

  componentDidMount() {
    CommentCountComponent.loadInstance();
  }

  componentDidUpdate() {
    CommentCountComponent.loadInstance();
  }

  render() {
    const { identifier, url } = this.props;

    return (
      <span className={styles.comment}>
        <span className={styles.icon}>
          <MessageSquare aria-label="Comment count" />
        </span>
        <span
          className="disqus-comment-count"
          data-disqus-identifier={identifier}
          data-disqus-url={url}
        />
      </span>
    );
  }
}

export default serverSkip(CommentCountComponent);
