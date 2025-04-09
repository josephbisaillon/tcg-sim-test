/**
 * This file contains action creators for connection-related actions.
 * These action creators are used to dispatch actions to the Redux store.
 */

import { AppDispatch } from '../store';
import {
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
    Participant,
} from '../store/slices/connectionSlice';

import { socketService } from '../services/socketService';
import { sendSystemMessage } from './chatActions';

/**
 * Initialize the socket connection
 * @param serverUrl The URL of the server to connect to
 */
export const initializeConnection = (serverUrl: string) => (dispatch: AppDispatch) => {
    dispatch(setConnecting());
    socketService.init(serverUrl);
};

/**
 * Disconnect from the server
 */
export const disconnectFromServer = () => (dispatch: AppDispatch) => {
    socketService.disconnect();
    dispatch(setDisconnected('Disconnected by user'));
    dispatch(sendSystemMessage('Disconnected from server'));
};

/**
 * Reconnect to the server
 */
export const reconnectToServer = () => (dispatch: AppDispatch) => {
    dispatch(setConnecting());
    socketService.reconnect();
};

/**
 * Clear the connection error
 */
export const clearConnectionErrorState = () => (dispatch: AppDispatch) => {
    dispatch(clearConnectionError());
};

/**
 * Join a game room
 * @param roomId The ID of the room to join
 * @param username The username to use in the room
 */
export const joinGameRoom = (roomId: string, username: string) => (dispatch: AppDispatch) => {
    socketService.joinRoom(roomId, username);
    dispatch(sendSystemMessage(`Joining room: ${roomId}`));
};

/**
 * Leave the current game room
 */
export const leaveGameRoom = () => (dispatch: AppDispatch) => {
    socketService.leaveRoom();
    dispatch(clearRoomId());
    dispatch(sendSystemMessage('Leaving room'));
};

/**
 * Set the current room ID
 * @param roomId The ID of the room
 */
export const setCurrentRoomId = (roomId: string) => (dispatch: AppDispatch) => {
    dispatch(setRoomId(roomId));
};

/**
 * Clear the current room ID
 */
export const clearCurrentRoomId = () => (dispatch: AppDispatch) => {
    dispatch(clearRoomId());
};

/**
 * Set the participants in the room
 * @param participants The participants in the room
 */
export const setRoomParticipants = (participants: Participant[]) => (dispatch: AppDispatch) => {
    dispatch(setParticipants(participants));
};

/**
 * Add a participant to the room
 * @param participant The participant to add
 */
export const addRoomParticipant = (participant: Participant) => (dispatch: AppDispatch) => {
    dispatch(addParticipant(participant));
    dispatch(sendSystemMessage(`${participant.username} joined the room`));
};

/**
 * Remove a participant from the room
 * @param participantId The ID of the participant to remove
 * @param username The username of the participant (for the system message)
 */
export const removeRoomParticipant = (participantId: string, username: string) => (dispatch: AppDispatch) => {
    dispatch(removeParticipant(participantId));
    dispatch(sendSystemMessage(`${username} left the room`));
};

/**
 * Update a participant in the room
 * @param id The ID of the participant to update
 * @param updates The updates to apply to the participant
 */
export const updateRoomParticipant = (id: string, updates: Partial<Participant>) => (dispatch: AppDispatch) => {
    dispatch(updateParticipant({ id, updates }));
};

/**
 * Start syncing the game state
 */
export const startSyncing = () => (dispatch: AppDispatch) => {
    dispatch(setSyncing());
    dispatch(sendSystemMessage('Syncing game state...'));
};

/**
 * Update the sync progress
 * @param progress The sync progress (0-100)
 */
export const updateSyncProgress = (progress: number) => (dispatch: AppDispatch) => {
    dispatch(setSyncProgress(progress));
};

/**
 * Set the sync state to complete
 */
export const completeSyncing = () => (dispatch: AppDispatch) => {
    dispatch(setSynced());
    dispatch(sendSystemMessage('Game state synchronized'));
};

/**
 * Set a sync error
 * @param error The error message
 */
export const setSyncErrorState = (error: string) => (dispatch: AppDispatch) => {
    dispatch(setSyncError(error));
    dispatch(sendSystemMessage(`Sync error: ${error}`));
};

/**
 * Check if the socket is connected
 * @returns Whether the socket is connected
 */
export const isSocketConnected = (): boolean => {
    return socketService.isConnected();
};

/**
 * Get the socket ID
 * @returns The socket ID, or null if not connected
 */
export const getSocketId = (): string | null => {
    return socketService.getSocketId();
};
