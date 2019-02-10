// @flow
import type { DisqusConfig } from 'types/views';
import React, { PureComponent } from 'react';
import config from 'config';
import insertScript from 'utils/insertScript';
import { getScriptErrorHandler } from 'utils/error';
import { MessageSquare } from 'views/components/icons';
import styles from './CommentCount.scss';

type Props = DisqusConfig;

const SCRIPT_ID = 'dsq-count-scr';

export default class CommentCount extends PureComponent<Props> {
  static loadInstance() {
    if (window.document.getElementById(SCRIPT_ID)) {
      if (window.DISQUSWIDGETS) {
        window.DISQUSWIDGETS.getCount({
          reset: true,
        });
      }
    } else {
      insertScript(`https://${config.disqusShortname}.disqus.com/count.js`, {
        id: SCRIPT_ID,
        async: true,
      }).catch(getScriptErrorHandler('Disqus comment count'));
    }
  }

  componentDidMount() {
    CommentCount.loadInstance();
  }

  componentDidUpdate() {
    CommentCount.loadInstance();
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
