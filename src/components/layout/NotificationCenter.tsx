import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../context/AuthContext';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead, Notification } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';

// Styled components
const NotificationButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Badge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background-color: hsl(var(--primary));
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationPanel = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  max-width: 100vw;
  max-height: 400px;
  overflow-y: auto;
  background-color: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  margin-top: 0.5rem;
  z-index: 50;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid hsl(var(--border));
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: hsl(var(--primary));
  font-size: 0.875rem;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const NotificationList = styled.div`
  max-height: 320px;
  overflow-y: auto;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: hsl(var(--muted-foreground));
`;

const NotificationItem = styled.div<{ isRead: boolean }>`
  padding: 1rem;
  border-bottom: 1px solid hsl(var(--border));
  background-color: ${props => props.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)'};
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const NotificationMessage = styled.div`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 0.5rem;
`;

const NotificationTime = styled.div`
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
`;

// Icon component
const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Helper to format notification timestamp
const formatNotificationTime = (timestamp: any): string => {
  if (!timestamp) return '';
  
  try {
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHrs = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting notification time:', error);
    return '';
  }
};

export default function NotificationCenter() {
  const { currentUser, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadNotifications = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        console.log('Loading notifications for user:', currentUser.uid);
        
        // First, get notifications using the Firebase Auth UID
        const uidNotifications = await getUserNotifications(currentUser.uid);
        console.log(`Found ${uidNotifications.length} notifications for user.uid: ${currentUser.uid}`);
        
        let allNotifications = [...uidNotifications];
        
        // If the user has an email, also try to get notifications with that ID
        if (currentUser.email) {
          try {
            console.log('Also checking for notifications with email:', currentUser.email);
            const emailNotifications = await getUserNotifications(currentUser.email);
            console.log(`Found ${emailNotifications.length} notifications for user.email: ${currentUser.email}`);
            
            // Add email notifications that aren't already in the list (avoid duplicates by ID)
            const existingIds = new Set(allNotifications.map(n => n.id));
            const uniqueEmailNotifications = emailNotifications.filter(n => n.id && !existingIds.has(n.id));
            
            console.log(`Adding ${uniqueEmailNotifications.length} unique notifications from email lookup`);
            allNotifications = [...allNotifications, ...uniqueEmailNotifications];
          } catch (emailError) {
            console.error('Error loading notifications by email:', emailError);
          }
        }
        
        // Sort notifications by created time (newest first)
        allNotifications.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.seconds - a.createdAt.seconds;
        });
        
        console.log(`Total combined notifications: ${allNotifications.length}`);
        setNotifications(allNotifications);
        setUnreadCount(allNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadNotifications();
    
    // Add a listener to close the panel when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentUser]);
  
  const handleNotificationClick = async (notification: Notification) => {
    // Mark notification as read
    if (!notification.read && notification.id) {
      try {
        await markNotificationRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? {...n, read: true} : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Close the panel first
    setIsOpen(false);
    
    // Add a small delay to allow the panel to close before navigation
    setTimeout(() => {
      console.log('Navigating based on notification type:', {
        type: notification.type,
        competitionId: notification.competitionId,
        supportTicketId: notification.supportTicketId
      });
      
      // Navigate based on notification type
      if (notification.type === 'ticket_update' && notification.supportTicketId) {
        console.log(`Navigating to support ticket: ${notification.supportTicketId}`);
        // Direct admins to admin support page, regular users to the user support page
        if (isAdmin) {
          // Use the proper route for admin support
          const ticketId = notification.supportTicketId;
          navigate(`/admin?tab=support&ticketId=${ticketId}`);
        } else {
          navigate(`/support?ticketId=${notification.supportTicketId}`);
        }
      } else if (notification.type === 'competition_winner' && notification.competitionId) {
        console.log(`Navigating to winner competition: ${notification.competitionId}`);
        navigate(`/competition/${notification.competitionId}`);
      } else if (notification.competitionId) {
        console.log(`Navigating to competition: ${notification.competitionId}`);
        navigate(`/competition/${notification.competitionId}`);
      } else if (notification.type === 'ticket_purchase' && notification.ticketId) {
        console.log(`Navigating to ticket details: ${notification.ticketId}`);
        navigate(`/profile/tickets?ticketId=${notification.ticketId}`);
      } else if (notification.type === 'credit_update') {
        console.log('Navigating to profile/credits');
        navigate('/profile/credits');
      } else if (notification.type === 'system') {
        // Default for system notifications is to do nothing
        console.log('System notification - no specific navigation');
      } else {
        // Default fallback if no specific route is determined
        console.log('No specific navigation path for this notification type');
      }
    }, 100); // Small delay for better UX
  };
  
  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    
    try {
      // Mark all notifications read for Firebase Auth UID
      await markAllNotificationsRead(currentUser.uid);
      
      // Also mark all notifications read for email if it exists
      if (currentUser.email) {
        try {
          await markAllNotificationsRead(currentUser.email);
        } catch (emailError) {
          console.error('Error marking email notifications as read:', emailError);
        }
      }
      
      setNotifications(prev => prev.map(n => ({...n, read: true})));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const togglePanel = () => {
    setIsOpen(prev => !prev);
  };
  
  if (!currentUser) return null;
  
  return (
    <div style={{ position: 'relative' }}>
      <NotificationButton onClick={togglePanel}>
        <BellIcon />
        {unreadCount > 0 && <Badge>{unreadCount > 9 ? '9+' : unreadCount}</Badge>}
      </NotificationButton>
      
      {isOpen && (
        <NotificationPanel ref={panelRef}>
          <NotificationHeader>
            <HeaderTitle>Notifications</HeaderTitle>
            {unreadCount > 0 && (
              <ClearButton onClick={handleMarkAllRead}>
                Mark all as read
              </ClearButton>
            )}
          </NotificationHeader>
          
          <NotificationList>
            {loading ? (
              <LoadingIndicator>Loading notifications...</LoadingIndicator>
            ) : notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  isRead={notification.read}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  <NotificationMessage>{notification.message}</NotificationMessage>
                  <NotificationTime>
                    {formatNotificationTime(notification.createdAt)}
                  </NotificationTime>
                </NotificationItem>
              ))
            ) : (
              <EmptyState>No notifications</EmptyState>
            )}
          </NotificationList>
        </NotificationPanel>
      )}
    </div>
  );
} 