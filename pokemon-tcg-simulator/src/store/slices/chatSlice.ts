import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for the chat state
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
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: string;
    read: boolean;
    autoHide?: boolean;
    duration?: number;
}

interface ChatState {
    messages: ChatMessage[];
    notifications: Notification[];
    unreadCount: number;
    isMinimized: boolean;
}

// Define the initial state
const initialState: ChatState = {
    messages: [],
    notifications: [],
    unreadCount: 0,
    isMinimized: false,
};

// Create the chat slice
const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        // Message actions
        addMessage: (state, action: PayloadAction<ChatMessage>) => {
            state.messages.push(action.payload);
            if (state.isMinimized) {
                state.unreadCount += 1;
            }
        },
        addSystemMessage: (state, action: PayloadAction<string>) => {
            const systemMessage: ChatMessage = {
                id: Date.now().toString(),
                senderId: 'system',
                senderName: 'System',
                content: action.payload,
                timestamp: new Date().toISOString(),
                type: 'system',
            };
            state.messages.push(systemMessage);
            if (state.isMinimized) {
                state.unreadCount += 1;
            }
        },
        addActionMessage: (state, action: PayloadAction<{ playerId: string; playerName: string; action: string }>) => {
            const actionMessage: ChatMessage = {
                id: Date.now().toString(),
                senderId: action.payload.playerId,
                senderName: action.payload.playerName,
                content: action.payload.action,
                timestamp: new Date().toISOString(),
                type: 'action',
            };
            state.messages.push(actionMessage);
            if (state.isMinimized) {
                state.unreadCount += 1;
            }
        },
        clearMessages: (state) => {
            state.messages = [];
        },

        // Notification actions
        addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
            const notification: Notification = {
                id: Date.now().toString(),
                ...action.payload,
                timestamp: new Date().toISOString(),
                read: false,
            };
            state.notifications.push(notification);
        },
        markNotificationAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find((n) => n.id === action.payload);
            if (notification) {
                notification.read = true;
            }
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter((n) => n.id !== action.payload);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },

        // Chat UI actions
        minimizeChat: (state) => {
            state.isMinimized = true;
        },
        maximizeChat: (state) => {
            state.isMinimized = false;
            state.unreadCount = 0;
        },
        resetUnreadCount: (state) => {
            state.unreadCount = 0;
        },
    },
});

// Export actions and reducer
export const {
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
} = chatSlice.actions;

export default chatSlice.reducer;
