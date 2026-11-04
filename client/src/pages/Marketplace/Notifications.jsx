
import React, { useMemo, useState, useEffect } from 'react';
import './Notifications.css';

const getInitialNotifications = (role) => {
  if (role === 'buyer') {
    return [
      {
        id: 'buyer-1',
        type: 'order',
        title: 'Order Confirmed',
        message: 'Your order AGRO-1001 has been placed successfully.',
        date: '2026-11-03T10:30:00',
        read: false,
        reference: 'AGRO-1001',
      },
      {
        id: 'buyer-2',
        type: 'delivery',
        title: 'Order Shipped',
        message: 'Your agricultural products are on their way.',
        date: '2026-11-03T09:15:00',
        read: false,
        reference: 'AGRO-1001',
      },
      {
        id: 'buyer-3',
        type: 'system',
        title: 'Welcome to AgroSphere',
        message: 'Discover fresh agricultural products directly from farmers.',
        date: '2026-11-02T16:45:00',
        read: true,
        reference: 'SYSTEM',
      },
      {
        id: 'buyer-4',
        type: 'purchase',
        title: 'Payment Update',
        message: 'Your order payment information is available in My Orders.',
        date: '2026-11-02T12:20:00',
        read: false,
        reference: 'AGRO-1001',
      },
      {
        id: 'buyer-5',
        type: 'system',
        title: 'Profile Reminder',
        message: 'Keep your account and delivery details up to date.',
        date: '2026-11-01T11:00:00',
        read: true,
        reference: 'SYSTEM',
      },
    ];
  }

  return [
    {
      id: 'farmer-1',
      type: 'order',
      title: 'New Order Received',
      message: 'You have received a new order for 50 KG of Organic Wheat.',
      date: '2026-11-03T10:30:00',
      read: false,
      reference: 'ORD-1001',
    },
    {
      id: 'farmer-2',
      type: 'purchase',
      title: 'New Purchase Request',
      message: 'FreshMart Retail has sent you a bulk purchase request.',
      date: '2026-11-03T09:15:00',
      read: false,
      reference: 'PR-1001',
    },
    {
      id: 'farmer-3',
      type: 'delivery',
      title: 'Delivery Update',
      message: 'Your order ORD-0998 has been marked as In Transit.',
      date: '2026-11-02T16:45:00',
      read: true,
      reference: 'ORD-0998',
    },
    {
      id: 'farmer-4',
      type: 'enquiry',
      title: 'New Customer Enquiry',
      message: 'Rahul Sharma has asked about the availability of Basmati Rice.',
      date: '2026-11-02T12:20:00',
      read: false,
      reference: 'ENQ-1001',
    },
    {
      id: 'farmer-5',
      type: 'system',
      title: 'Profile Reminder',
      message: 'Keep your farmer profile and contact information up to date.',
      date: '2026-11-01T11:00:00',
      read: true,
      reference: 'SYSTEM',
    },
  ];
};

const Notifications = ({ role = 'farmer', profile }) => {
  const userKey = profile?.email?.trim().toLowerCase() || 'guest';
  const storageKey = `agrosphere_notifications_${role}_${userKey}`;

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : getInitialNotifications(role);
    } catch {
      return getInitialNotifications(role);
    }
  });

  const [filter, setFilter] = useState('All');

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notifications));
  }, [notifications, storageKey]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (filter === 'Unread') {
      return notifications.filter((item) => !item.read);
    }

    if (filter === 'Read') {
      return notifications.filter((item) => item.read);
    }

    return notifications;
  }, [notifications, filter]);

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((item) => ({ ...item, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const getIcon = (type) => {
    const icons = {
      order: 'fa-shopping-bag',
      purchase: 'fa-boxes',
      delivery: 'fa-truck',
      enquiry: 'fa-comments',
      system: 'fa-info-circle',
    };

    return icons[type] || 'fa-bell';
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="farmer-notifications-page">
      <div className="farmer-notifications-header">
        <div>
          <span className="farmer-notifications-eyebrow">
            {role === 'buyer' ? 'BUYER DASHBOARD' : 'FARMER DASHBOARD'}
          </span>

          <h2>Notifications</h2>

          <p>
            {role === 'buyer'
              ? 'Stay updated with your orders and marketplace activities.'
              : 'Stay updated with your marketplace activities.'}
          </p>
        </div>

        <button
          type="button"
          className="mark-all-notifications-btn"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <i className="fas fa-check-double me-2"></i>
          Mark All as Read
        </button>
      </div>

      <div className="farmer-notification-summary">
        <div>
          <span>Total Notifications</span>
          <h3>{notifications.length}</h3>
        </div>

        <div>
          <span>Unread Notifications</span>
          <h3>{unreadCount}</h3>
        </div>
      </div>

      <div className="farmer-notifications-toolbar">
        {['All', 'Unread', 'Read'].map((item) => (
          <button
            type="button"
            key={item}
            className={filter === item ? 'active' : ''}
            onClick={() => setFilter(item)}
          >
            {item}

            {item === 'Unread' && unreadCount > 0 && (
              <span>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="farmer-notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`farmer-notification-card ${
                notification.read ? 'read' : 'unread'
              }`}
            >
              <div className={`farmer-notification-icon ${notification.type}`}>
                <i className={`fas ${getIcon(notification.type)}`}></i>
              </div>

              <div className="farmer-notification-content">
                <div className="farmer-notification-title-row">
                  <h4>{notification.title}</h4>

                  {!notification.read && (
                    <span className="farmer-notification-dot"></span>
                  )}
                </div>

                <p>{notification.message}</p>

                <div className="farmer-notification-meta">
                  <span>
                    <i className="far fa-clock me-1"></i>
                    {formatDate(notification.date)}
                  </span>

                  <span>Reference: {notification.reference}</span>
                </div>
              </div>

              <div className="farmer-notification-actions">
                {!notification.read && (
                  <button
                    type="button"
                    title="Mark as read"
                    aria-label="Mark notification as read"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <i className="fas fa-check"></i>
                  </button>
                )}

                <button
                  type="button"
                  className="delete-notification-btn"
                  title="Delete notification"
                  aria-label="Delete notification"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="farmer-notifications-empty">
            <i className="far fa-bell"></i>
            <h3>No notifications found</h3>
            <p>You're all caught up. Check back for new updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
