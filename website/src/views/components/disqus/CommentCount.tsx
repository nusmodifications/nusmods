import * as React from 'react';
import { useEffect } from 'react';
import { connect } from 'react-redux';

import { MessageSquare } from 'react-feather';
import config from 'config';
import insertScript from 'utils/insertScript';
import { getScriptErrorHandler } from 'utils/error';

import type { State as StoreState } from 'types/state';
import type { DisqusConfig } from 'types/views';

import styles from './CommentCount.scss';

type Props = DisqusConfig & {
  loadDisqusManually: boolean;
};

const SCRIPT_ID = 'dsq-count-scr';

function loadInstance() {
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

export const CommentCountComponent: React.FC<Props> = ({ identifier, url, loadDisqusManually }) => {
  useEffect(() => {
    if (!loadDisqusManually) {
      loadInstance();
    }
  }, [loadDisqusManually]);

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
};

const CommentCount = connect((state: StoreState) => ({
  loadDisqusManually: state.settings.loadDisqusManually,
}))(CommentCountComponent);

export default CommentCount;
