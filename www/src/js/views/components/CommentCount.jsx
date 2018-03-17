// @flow
import React, { PureComponent } from 'react';
import config from 'config';
import insertScript from 'utils/insertScript';
import { MessageSquare } from 'views/components/icons';
import styles from './CommentCount.scss';

type Props = {
  children: Node,
  url: string,
  identifier: string,
  title: string,
  commentIcon: Node,
};

type Option = {
  reset: boolean,
};

const SCRIPT_ID = 'dsq-count-scr';

export const MESSAGE_SQUARE_LABEL = 'Open menu';

export default class CommentCount extends PureComponent<Props> {
  static defaultProps = {
    commentIcon: <MessageSquare aria-label={MESSAGE_SQUARE_LABEL} />,
  };

  componentDidMount() {
    this.loadInstance();
  }

  componentDidUpdate() {
    this.loadInstance();
  }

  loadInstance() {
    if (window.document.getElementById('dsq-count-scr')) {
      this.queueResetCount();
    } else {
      insertScript(`https://${config.disqusShortname}.disqus.com/count.js`, SCRIPT_ID, true);
    }
  }

  option: Option = {
    reset: true,
  };

  queueResetCount() {
    if (window.DISQUSWIDGETS) {
      window.DISQUSWIDGETS.getCount(this.option);
    }
  }

  render() {
    const { identifier, url, children, commentIcon } = this.props;
    return (
      <span className={styles.comment}>
        <span className={styles.icon}> {commentIcon} </span>
        <span
          className="disqus-comment-count"
          data-disqus-identifier={identifier}
          data-disqus-url={url}
        >
          {children}
        </span>
      </span>
    );
  }
}
