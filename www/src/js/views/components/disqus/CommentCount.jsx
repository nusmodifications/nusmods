// @flow
import type { DisqusConfig } from 'types/views';

import React, { PureComponent } from 'react';
import config from 'config';
import insertScript from 'utils/insertScript';
import { MessageSquare } from 'views/components/icons';
import styles from './CommentCount.scss';

type Props = DisqusConfig & {
  commentIcon: Node,
};

const SCRIPT_ID = 'dsq-count-scr';

export default class CommentCount extends PureComponent<Props> {
  static defaultProps = {
    commentIcon: <MessageSquare aria-label="Comment count" />,
  };

  static loadInstance() {
    if (window.document.getElementById(SCRIPT_ID)) {
      if (window.DISQUSWIDGETS) {
        window.DISQUSWIDGETS.getCount({
          reset: true,
        });
      }
    } else {
      insertScript(`https://${config.disqusShortname}.disqus.com/count.js`, SCRIPT_ID, true);
    }
  }

  componentDidMount() {
    CommentCount.loadInstance();
  }

  componentDidUpdate() {
    CommentCount.loadInstance();
  }

  render() {
    const { identifier, url, commentIcon } = this.props;

    return (
      <span className={styles.comment}>
        <span className={styles.icon}> {commentIcon} </span>
        <span
          className="disqus-comment-count"
          data-disqus-identifier={identifier}
          data-disqus-url={url}
        />
      </span>
    );
  }
}
