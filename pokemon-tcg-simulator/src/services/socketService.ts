import { io, Socket } from 'socket.io-client';
import { store, RootState } from '../store';
import { ConnectionState, Participant } from '../store/slices/connectionSlice';
import {
    setConnecting,
    setConnected,
    setDisconnected,
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
} from '../store/slices/connectionSlice';
import { addSystemMessage, addActionMessage } from '../store/slices/chatSlice';

// Define event types for type safety
export enum SocketEvents {
    // Connection events
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    CONNECT_ERROR = 'connect_error',

    // Room events
    JOIN_ROOM = 'join_room',
    LEAVE_ROOM = 'leave_room',
    ROOM_JOINED = 'room_joined',
    ROOM_LEFT = 'room_left',
    PARTICIPANT_JOINED = 'participant_joined',
    PARTICIPANT_LEFT = 'participant_left',
    PARTICIPANT_UPDATED = 'participant_updated',

    // Game state events
    SYNC_STATE = 'sync_state',
    SYNC_PROGRESS = 'sync_progress',
    SYNC_COMPLETE = 'sync_complete',
    SYNC_ERROR = 'sync_error',

    // Game action events
    GAME_ACTION = 'game_action',
    ACTION_ACKNOWLEDGED = 'action_acknowledged',
    ACTION_REJECTED = 'action_rejected',

    // Chat events
    CHAT_MESSAGE = 'chat_message',
    SYSTEM_MESSAGE = 'system_message',
    ACTION_MESSAGE = 'action_message',
}

// Define the socket service class
class SocketService {
    private socket: Socket | null = null;
    private serverUrl: string = '';

    // Initialize the socket connection
    public init(url: string): void {
        if (this.socket) {
            console.warn('Socket connection already initialized');
            return;
        }

        this.serverUrl = url;
        store.dispatch(setConnecting());

        this.socket = io(url, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        this.setupEventListeners();
    }

    // Set up event listeners for socket events
    private setupEventListeners(): void {
        if (!this.socket) {
            console.error('Cannot set up event listeners: Socket not initialized');
            return;
        }

        // Connection events
        this.socket.on(SocketEvents.CONNECT, () => {
            store.dispatch(setConnected(this.socket?.id || ''));
            store.dispatch(addSystemMessage('Connected to server'));
        });

        this.socket.on(SocketEvents.DISCONNECT, (reason) => {
            store.dispatch(setDisconnected(reason));
            store.dispatch(addSystemMessage(`Disconnected from server: ${reason}`));
        });

        this.socket.on(SocketEvents.CONNECT_ERROR, (error) => {
            store.dispatch(setDisconnected(error.message));
            store.dispatch(addSystemMessage(`Connection error: ${error.message}`));
        });

        // Room events
        this.socket.on(SocketEvents.ROOM_JOINED, (data: { roomId: string; participants: any[] }) => {
            store.dispatch(setRoomId(data.roomId));
            store.dispatch(setParticipants(data.participants));
            store.dispatch(addSystemMessage(`Joined room: ${data.roomId}`));
        });

        this.socket.on(SocketEvents.ROOM_LEFT, () => {
            store.dispatch(clearRoomId());
            store.dispatch(setParticipants([]));
            store.dispatch(addSystemMessage('Left room'));
        });

        this.socket.on(SocketEvents.PARTICIPANT_JOINED, (participant) => {
            store.dispatch(addParticipant(participant));
            store.dispatch(addSystemMessage(`${participant.username} joined the room`));
        });

        this.socket.on(SocketEvents.PARTICIPANT_LEFT, (participantId) => {
            const state = store.getState() as RootState;
            const connectionState = state.connection as ConnectionState;
            const participant = connectionState.participants.find((p: Participant) => p.id === participantId);
            if (participant) {
                store.dispatch(removeParticipant(participantId));
                store.dispatch(addSystemMessage(`${participant.username} left the room`));
            }
        });

        this.socket.on(SocketEvents.PARTICIPANT_UPDATED, (data) => {
            store.dispatch(updateParticipant(data));
        });

        // Sync events
        this.socket.on(SocketEvents.SYNC_STATE, () => {
            store.dispatch(setSyncing());
            store.dispatch(addSystemMessage('Syncing game state...'));
        });

        this.socket.on(SocketEvents.SYNC_PROGRESS, (progress: number) => {
            store.dispatch(setSyncProgress(progress));
        });

        this.socket.on(SocketEvents.SYNC_COMPLETE, () => {
            store.dispatch(setSynced());
            store.dispatch(addSystemMessage('Game state synchronized'));
        });

        this.socket.on(SocketEvents.SYNC_ERROR, (error: string) => {
            store.dispatch(setSyncError(error));
            store.dispatch(addSystemMessage(`Sync error: ${error}`));
        });

        // Game action events
        this.socket.on(SocketEvents.ACTION_ACKNOWLEDGED, (action) => {
            // Handle action acknowledgement
            console.log('Action acknowledged:', action);
        });

        this.socket.on(SocketEvents.ACTION_REJECTED, (data) => {
            // Handle action rejection
            console.error('Action rejected:', data);
            store.dispatch(addSystemMessage(`Action rejected: ${data.reason}`));
        });

        // Chat events
        this.socket.on(SocketEvents.CHAT_MESSAGE, (message) => {
            store.dispatch({ type: 'chat/addMessage', payload: message });
        });

        this.socket.on(SocketEvents.SYSTEM_MESSAGE, (message: string) => {
            store.dispatch(addSystemMessage(message));
        });

        this.socket.on(SocketEvents.ACTION_MESSAGE, (data: { playerId: string; playerName: string; action: string }) => {
            store.dispatch(addActionMessage(data));
        });
    }

    // Join a game room
    public joinRoom(roomId: string, username: string): void {
        if (!this.socket) {
            console.error('Cannot join room: Socket not initialized');
            return;
        }

        this.socket.emit(SocketEvents.JOIN_ROOM, { roomId, username });
    }

    // Leave the current room
    public leaveRoom(): void {
        if (!this.socket) {
            console.error('Cannot leave room: Socket not initialized');
            return;
        }

        this.socket.emit(SocketEvents.LEAVE_ROOM);
    }

    // Send a game action
    public sendGameAction(action: any): void {
        if (!this.socket) {
            console.error('Cannot send game action: Socket not initialized');
            return;
        }

        this.socket.emit(SocketEvents.GAME_ACTION, action);
    }

    // Send a chat message
    public sendChatMessage(content: string, isPrivate: boolean = false, recipientId?: string): void {
        if (!this.socket) {
            console.error('Cannot send chat message: Socket not initialized');
            return;
        }

        const state = store.getState() as RootState;
        const connectionState = state.connection as ConnectionState;
        const participants = connectionState.participants;
        const currentUser = participants.find((p: Participant) => p.id === this.socket?.id);

        if (!currentUser) {
            console.error('Cannot send chat message: Current user not found');
            return;
        }

        const message = {
            id: Date.now().toString(),
            senderId: currentUser.id,
            senderName: currentUser.username,
            content,
            timestamp: new Date().toISOString(),
            type: 'user',
            isPrivate,
            recipientId,
        };

        this.socket.emit(SocketEvents.CHAT_MESSAGE, message);
    }

    // Disconnect from the server
    public disconnect(): void {
        if (!this.socket) {
            console.warn('Cannot disconnect: Socket not initialized');
            return;
        }

        this.socket.disconnect();
        this.socket = null;
    }

    // Reconnect to the server
    public reconnect(): void {
        if (this.socket) {
            this.socket.connect();
        } else if (this.serverUrl) {
            this.init(this.serverUrl);
        } else {
            console.error('Cannot reconnect: No server URL provided');
        }
    }

    // Check if the socket is connected
    public isConnected(): boolean {
        return this.socket?.connected || false;
    }

    // Get the socket ID
    public getSocketId(): string | null {
        return this.socket?.id || null;
    }
}

// Create and export a singleton instance
export const socketService = new SocketService();
