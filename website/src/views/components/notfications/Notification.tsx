import { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'components/ui/button';
import { Toast, ToastDescription, ToastProvider, ToastViewport } from 'components/ui/toast';

import { NotificationData } from 'types/reducers';
import { popNotification } from 'actions/app';
import { State as StoreState } from 'types/state';
import styles from './Notification.scss';

type Props = {
  notifications: NotificationData[];
  popNotification: () => void;
};

const DEFAULT_TIMEOUT = 2750;

export const NotificationComponent: React.FC<Props> = ({ notifications, popNotification: pop }) => {
  const notification = notifications[0];
  const previous = useRef(notification);
  const actionClicked = useRef(false);
  const [shown, setShown] = useState({ notification, sequence: 0 });

  // A fresh Toast restarts the dismissal timer even when consecutive messages have identical copy.
  if (shown.notification !== notification) {
    setShown({ notification, sequence: shown.sequence + 1 });
  }

  useEffect(() => {
    if (previous.current !== notification) {
      previous.current?.willClose?.(
        !notifications.includes(previous.current),
        actionClicked.current,
      );
      previous.current = notification;
      actionClicked.current = false;
    }
  }, [notification, notifications]);

  return (
    <ToastProvider swipeDirection="right">
      {notification && (
        <Toast
          key={shown.sequence}
          open
          duration={notification.timeout || DEFAULT_TIMEOUT}
          onOpenChange={(open) => {
            if (!open) pop();
          }}
        >
          <ToastDescription>{notification.message}</ToastDescription>
          {notification.action && (
            <Button
              variant="ghost"
              size="sm"
              className={styles.notificationAction}
              onClick={() => {
                actionClicked.current = true;
                // Some actions intentionally leave the notification open.
                if (notification.action?.handler?.() === false) return;
                pop();
              }}
            >
              {notification.action.text}
            </Button>
          )}
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  );
};

export default connect((state: StoreState) => ({ notifications: state.app.notifications }), {
  popNotification,
})(NotificationComponent);
