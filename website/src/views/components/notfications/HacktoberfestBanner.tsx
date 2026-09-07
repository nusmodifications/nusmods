import { Button } from 'components/ui/button';
import { Alert } from 'components/ui/alert';
import { PureComponent } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';

import { Heart } from 'react-feather';
import type { EmptyProps } from 'types/utils';
import storage from 'storage';
import { HACKTOBERFEST } from 'storage/keys';
import CloseButton from 'views/components/CloseButton';
import styles from './Announcements.scss';

type Props = EmptyProps;
type State = {
  isOpen: boolean;
};

const today = new Date();

export default class HacktoberfestBanner extends PureComponent<Props, State> {
  override state: State = {
    isOpen: !storage.getItem(HACKTOBERFEST) && (today.getMonth() === 9 || today.getMonth() === 10),
  };

  dismiss = () => {
    storage.setItem(HACKTOBERFEST, true);
    this.setState({ isOpen: false });
  };

  override render() {
    if (!this.state.isOpen) return null;

    return (
      <Alert asChild variant="default">
        <div
          className={classnames(
            'alert alert-info no-export',
            styles.announcement,
            styles.hacktoberfest,
          )}
        >
          <Heart className={styles.backgroundIcon} />

          <div className={styles.body}>
            <h3>Hacktoberfest 2018 now open!</h3>
            <p>Improve NUSMods by writing code and get free T-shirts at the same time!</p>
          </div>

          <div className={styles.buttons}>
            <Button asChild variant="secondary">
              <Link to="/hacktoberfest">Find out more</Link>
            </Button>

            <CloseButton className={styles.closeButton} onClick={this.dismiss} />
          </div>
        </div>
      </Alert>
    );
  }
}
