// @flow
import React, { PureComponent } from 'react';
import config from 'config';
import insertScript from 'utils/insertScript';
import { MessageSquare } from 'views/components/icons';
import styles from './CommentCount.scss';

type Props = {
  url: string,
  identifier: string,
  title: string,
  commentIcon: Node,
};

const SCRIPT_ID = 'dsq-count-scr';

export default class CommentCount extends PureComponent<Props> {
  static defaultProps = {
    commentIcon: <MessageSquare aria-label="Comment count" />,
  };

  componentDidMount() {
    this.loadInstance();
  }

  componentDidUpdate() {
    this.loadInstance();
  }

  loadInstance() {
    if (window.document.getElementById('dsq-count-scr')) {
      if (window.DISQUSWIDGETS) {
        window.DISQUSWIDGETS.getCount(this.option);
      }
    } else {
      insertScript(`https://${config.disqusShortname}.disqus.com/count.js`, SCRIPT_ID, true);
    }
  }

  option = {
    reset: true,
  };

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
