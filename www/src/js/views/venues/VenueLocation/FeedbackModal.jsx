// @flow

import type { VenueLocation } from 'types/venues';
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import Modal from 'views/components/Modal';
import CloseButton from 'views/components/CloseButton';
import ExternalLink from 'views/components/ExternalLink';
import { MapPinIcon, MapIcon } from 'views/components/icons';
import ImproveVenueForm from './ImproveVenueForm';
import styles from './VenueLocation.scss';

type Page = 'menu' | 'form';

type Props = {|
  +venue: string,
  +isOpen: boolean,
  +onRequestClose: () => void,
  +existingLocation: ?VenueLocation,
|};

type State = {|
  +page: Page,
|};

export default class FeedbackModal extends PureComponent<Props, State> {
  state: State = {
    page: 'menu',
  };

  onRequestClose = () => {
    this.setState({ page: 'menu' });
    this.props.onRequestClose();
  };

  renderPage() {
    switch (this.state.page) {
      case 'menu':
        return (
          <div className={classnames('row flex-fill text-center', styles.feedback)}>
            <div className="col-sm-6">
              <ExternalLink
                className="btn btn-outline-secondary"
                href="https://www.openstreetmap.org/fixthemap"
              >
                <MapIcon />
                <h3>Problem with map data</h3>
                <p>eg. incorrect building outline, missing walkways</p>
              </ExternalLink>
            </div>

            <div className="col-sm-6">
              <button
                className="btn btn-outline-secondary"
                onClick={() => this.setState({ page: 'form' })}
              >
                <MapPinIcon />
                <h3>Problem with venue data</h3>
                <p>eg. incorrect room name, floor, location of the map pin</p>
              </button>
            </div>
          </div>
        );

      case 'form':
        return (
          <ImproveVenueForm
            venue={this.props.venue}
            existingLocation={this.props.existingLocation}
            onBack={() => this.setState({ page: 'menu' })}
          />
        );

      default:
        throw new Error(`Unknown page ${this.state.page}`);
    }
  }

  render() {
    const { isOpen } = this.props;

    return (
      <Modal isOpen={isOpen} onRequestClose={this.onRequestClose} animate>
        <CloseButton onClick={this.onRequestClose} />
        <h2 className={styles.feedbackTitle}>Improve {this.props.venue}</h2>
        {this.renderPage()}
      </Modal>
    );
  }
}
