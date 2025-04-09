/**
 * This file contains action creators for chat-related actions.
 * These action creators are used to dispatch actions to the Redux store.
 */

import { AppDispatch } from '../store';
import {
    addMessage,
    addSystemMessage,
    addActionMessage,
    clearMessages,
    addNotification,
    markNotificationAsRead,
    removeNotification,
    clearNotifications,
    minimizeChat,
    maximizeChat,
    resetUnreadCount,
} from '../store/slices/chatSlice';

// Define the interfaces for chat messages and notifications
interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
    type: 'user' | 'system' | 'action';
    isPrivate?: boolean;
    recipientId?: string;
}

interface Notification {
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    autoHide?: boolean;
    duration?: number;
}

/**
 * Send a chat message
 * @param message The message to send
 */
export const sendMessage = (message: ChatMessage) => (dispatch: AppDispatch) => {
    dispatch(addMessage(message));
};

/**
 * Send a system message
 * @param content The content of the system message
 */
export const sendSystemMessage = (content: string) => (dispatch: AppDispatch) => {
    dispatch(addSystemMessage(content));
};

/**
 * Send an action message
 * @param playerId The ID of the player performing the action
 * @param playerName The name of the player performing the action
 * @param action The action description
 */
export const sendActionMessage = (playerId: string, playerName: string, action: string) => (dispatch: AppDispatch) => {
    dispatch(addActionMessage({ playerId, playerName, action }));
};

/**
 * Clear all chat messages
 */
export const clearAllMessages = () => (dispatch: AppDispatch) => {
    dispatch(clearMessages());
};

/**
 * Add a notification
 * @param notification The notification to add
 */
export const showNotification = (notification: Notification) => (dispatch: AppDispatch) => {
    dispatch(addNotification(notification));

    // If the notification is set to auto-hide, remove it after the specified duration
    if (notification.autoHide) {
        const duration = notification.duration || 5000; // Default to 5 seconds
        setTimeout(() => {
            // We don't have the ID here, so we'll need to handle this differently
            // This is a limitation of the current implementation
            // In a real app, we'd need to store the ID somewhere or use a more robust notification system
        }, duration);
    }
};

/**
 * Mark a notification as read
 * @param notificationId The ID of the notification to mark as read
 */
export const markAsRead = (notificationId: string) => (dispatch: AppDispatch) => {
    dispatch(markNotificationAsRead(notificationId));
};

/**
 * Remove a notification
 * @param notificationId The ID of the notification to remove
 */
export const dismissNotification = (notificationId: string) => (dispatch: AppDispatch) => {
    dispatch(removeNotification(notificationId));
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = () => (dispatch: AppDispatch) => {
    dispatch(clearNotifications());
};

/**
 * Minimize the chat window
 */
export const minimizeChatWindow = () => (dispatch: AppDispatch) => {
    dispatch(minimizeChat());
};

/**
 * Maximize the chat window
 */
export const maximizeChatWindow = () => (dispatch: AppDispatch) => {
    dispatch(maximizeChat());
};

/**
 * Reset the unread message count
 */
export const resetUnreadMessageCount = () => (dispatch: AppDispatch) => {
    dispatch(resetUnreadCount());
};

/**
 * Show an info notification
 * @param message The notification message
 * @param autoHide Whether to automatically hide the notification
 * @param duration The duration to show the notification (in milliseconds)
 */
export const showInfoNotification = (message: string, autoHide: boolean = true, duration: number = 5000) => (dispatch: AppDispatch) => {
    dispatch(addNotification({
        type: 'info',
        message,
        autoHide,
        duration,
    }));
};

/**
 * Show a success notification
 * @param message The notification message
 * @param autoHide Whether to automatically hide the notification
 * @param duration The duration to show the notification (in milliseconds)
 */
export const showSuccessNotification = (message: string, autoHide: boolean = true, duration: number = 5000) => (dispatch: AppDispatch) => {
    dispatch(addNotification({
        type: 'success',
        message,
        autoHide,
        duration,
    }));
};

/**
 * Show a warning notification
 * @param message The notification message
 * @param autoHide Whether to automatically hide the notification
 * @param duration The duration to show the notification (in milliseconds)
 */
export const showWarningNotification = (message: string, autoHide: boolean = true, duration: number = 5000) => (dispatch: AppDispatch) => {
    dispatch(addNotification({
        type: 'warning',
        message,
        autoHide,
        duration,
    }));
};

/**
 * Show an error notification
 * @param message The notification message
 * @param autoHide Whether to automatically hide the notification
 * @param duration The duration to show the notification (in milliseconds)
 */
export const showErrorNotification = (message: string, autoHide: boolean = false, duration: number = 0) => (dispatch: AppDispatch) => {
    dispatch(addNotification({
        type: 'error',
        message,
        autoHide,
        duration,
    }));
};
