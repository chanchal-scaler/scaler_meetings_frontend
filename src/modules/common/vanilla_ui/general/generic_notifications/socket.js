import Socket from '@common/lib/socket';
import { isWindowHidden } from '@common/utils/browser';

const NOTIFICATION_CLASS = 'bottom-left';
const LS_KEY = 'nudgesMap';
const CHANNEL = 'NotificationChannel';
const NOTIFICATION_TIMER = 60000;

const genericNotification = (initialData = {}) => {
  const socket = new Socket(CHANNEL, initialData);
  const nudgesMap = JSON.parse(localStorage.getItem(LS_KEY)) || {};

  const connect = () => {
    socket.send('initialize_nudges');
  };

  const initialUnreadNotifications = payload => {
    if (!isWindowHidden()) {
      const {
        generic_notifications: showNotifications,
      } = payload.data;
      Object.assign(nudgesMap, showNotifications);
      let unreadNotificationIds = Object.keys(nudgesMap);
      if (unreadNotificationIds.length > 0) {
        socket.send('generic_notification', {
          id: unreadNotificationIds[0],
        });
      }
      const showNotificationsInterval = setInterval(() => {
        unreadNotificationIds = Object.keys(nudgesMap);
        if (unreadNotificationIds.length === 0) {
          localStorage.setItem(LS_KEY, JSON.stringify({}));
          clearInterval(showNotificationsInterval);
          return;
        }

        socket.send('generic_notification', {
          id: unreadNotificationIds[0],
        });
      }, NOTIFICATION_TIMER);
    }
  };

  const notification = payload => {
    const { data } = payload;
    const { data: notificationData } = data;
    if (!isWindowHidden()) {
      if (notificationData.id) {
        delete nudgesMap[notificationData.id];
        localStorage.setItem(LS_KEY, JSON.stringify(nudgesMap));
      }
      window.displayNotification(NOTIFICATION_CLASS, notificationData.message);
    } else if (!notificationData.id) {
      socket.send(
        'push_notification',
        {
          message: notificationData.message.header,
          notifications_id: notificationData.notification_id,
        },
      );
    }
  };

  socket.off('connected', connect);
  socket.on('connected', connect);
  socket.off('initialize_nudges', initialUnreadNotifications);
  socket.on('initialize_nudges', initialUnreadNotifications);
  socket.off('generic_notification', notification);
  socket.on('generic_notification', notification);

  return socket;
};

export default genericNotification;
