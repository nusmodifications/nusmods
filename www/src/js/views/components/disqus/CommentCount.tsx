import { DisqusConfig } from 'types/views';
import * as React from 'react';
import { connect } from 'react-redux';

import { State as StoreState } from 'reducers';
import config from 'config';
import insertScript from 'utils/insertScript';
import { getScriptErrorHandler } from 'utils/error';
import { MessageSquare } from 'views/components/icons';

import styles from './CommentCount.scss';

type Props = DisqusConfig & {
  loadDisqusManually: boolean;
};

const SCRIPT_ID = 'dsq-count-scr';

export class CommentCountComponent extends React.PureComponent<Props> {
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
    if (this.props.loadDisqusManually) return;
    CommentCountComponent.loadInstance();
  }

  componentDidUpdate() {
    if (this.props.loadDisqusManually) return;
    CommentCountComponent.loadInstance();
  }

  render() {
    const { identifier, url, loadDisqusManually } = this.props;
    if (loadDisqusManually) return null;

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

const CommentCount = connect((state: StoreState) => ({
  loadDisqusManually: state.settings.loadDisqusManually,
}))(CommentCountComponent);

export default CommentCount;
