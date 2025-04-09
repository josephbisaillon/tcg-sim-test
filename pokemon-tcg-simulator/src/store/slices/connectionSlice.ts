import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for the connection state
interface ConnectionStatus {
    isConnected: boolean;
    isConnecting: boolean;
    lastConnected: string | null;
    error: string | null;
}

interface SyncState {
    isSyncing: boolean;
    lastSynced: string | null;
    syncError: string | null;
    syncProgress: number;
}

export interface Participant {
    id: string;
    username: string;
    role: 'player' | 'spectator';
    isActive: boolean;
    joinedAt: string;
}

export interface ConnectionState {
    status: ConnectionStatus;
    syncState: SyncState;
    participants: Participant[];
    roomId: string | null;
    socketId: string | null;
}

// Define the initial state
const initialState: ConnectionState = {
    status: {
        isConnected: false,
        isConnecting: false,
        lastConnected: null,
        error: null,
    },
    syncState: {
        isSyncing: false,
        lastSynced: null,
        syncError: null,
        syncProgress: 0,
    },
    participants: [],
    roomId: null,
    socketId: null,
};

// Create the connection slice
const connectionSlice = createSlice({
    name: 'connection',
    initialState,
    reducers: {
        // Connection status actions
        setConnecting: (state) => {
            state.status.isConnecting = true;
            state.status.error = null;
        },
        setConnected: (state, action: PayloadAction<string>) => {
            state.status.isConnected = true;
            state.status.isConnecting = false;
            state.status.lastConnected = new Date().toISOString();
            state.socketId = action.payload;
            state.status.error = null;
        },
        setDisconnected: (state, action: PayloadAction<string | null>) => {
            state.status.isConnected = false;
            state.status.isConnecting = false;
            state.status.error = action.payload;
        },
        clearConnectionError: (state) => {
            state.status.error = null;
        },

        // Sync state actions
        setSyncing: (state) => {
            state.syncState.isSyncing = true;
            state.syncState.syncError = null;
            state.syncState.syncProgress = 0;
        },
        setSyncProgress: (state, action: PayloadAction<number>) => {
            state.syncState.syncProgress = action.payload;
        },
        setSynced: (state) => {
            state.syncState.isSyncing = false;
            state.syncState.lastSynced = new Date().toISOString();
            state.syncState.syncProgress = 100;
            state.syncState.syncError = null;
        },
        setSyncError: (state, action: PayloadAction<string>) => {
            state.syncState.isSyncing = false;
            state.syncState.syncError = action.payload;
        },

        // Room actions
        setRoomId: (state, action: PayloadAction<string>) => {
            state.roomId = action.payload;
        },
        clearRoomId: (state) => {
            state.roomId = null;
        },

        // Participant actions
        setParticipants: (state, action: PayloadAction<Participant[]>) => {
            state.participants = action.payload;
        },
        addParticipant: (state, action: PayloadAction<Participant>) => {
            state.participants.push(action.payload);
        },
        removeParticipant: (state, action: PayloadAction<string>) => {
            state.participants = state.participants.filter(
                (participant) => participant.id !== action.payload
            );
        },
        updateParticipant: (
            state,
            action: PayloadAction<{ id: string; updates: Partial<Participant> }>
        ) => {
            const index = state.participants.findIndex(
                (participant) => participant.id === action.payload.id
            );
            if (index >= 0) {
                state.participants[index] = {
                    ...state.participants[index],
                    ...action.payload.updates,
                };
            }
        },
    },
});

// Export actions and reducer
export const {
    setConnecting,
    setConnected,
    setDisconnected,
    clearConnectionError,
    setSyncing,
    setSyncProgress,
    setSynced,
    setSyncError,
    setRoomId,
    clearRoomId,
    setParticipants,
    addParticipant,
    removeParticipant,
    updateParticipant,
} = connectionSlice.actions;

export default connectionSlice.reducer;
