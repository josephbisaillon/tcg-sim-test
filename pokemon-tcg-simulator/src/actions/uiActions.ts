/**
 * This file contains action creators for UI-related actions.
 * These action creators are used to dispatch actions to the Redux store.
 */

import { AppDispatch } from '../store';
import {
    selectCard as selectCardAction,
    deselectCard,
    setActiveZone,
    clearActiveZones,
    openModal,
    closeModal,
    updatePreferences,
    resetPreferences,
    setLoading,
    setError,
} from '../store/slices/uiSlice';

import { Card, ZoneType } from '../types';

// Define the interface for the SelectedCard based on the uiSlice
interface SelectedCard {
    id: string;
    zoneId: string;
    playerId: string;
}

// Define the interface for the ActiveZone based on the uiSlice
interface ActiveZone {
    id: string;
    playerId: string;
    isActive: boolean;
}

/**
 * Select a card
 * @param card The card to select
 * @param zoneId The ID of the zone the card is in
 * @param playerId The ID of the player who owns the card
 */
export const selectCard = (card: Card, zoneId: string, playerId: string) => (dispatch: AppDispatch) => {
    const selectedCard: SelectedCard = {
        id: card.id,
        zoneId,
        playerId,
    };
    dispatch(selectCardAction(selectedCard));
};

/**
 * Deselect the currently selected card
 */
export const clearSelectedCard = () => (dispatch: AppDispatch) => {
    dispatch(deselectCard());
};

/**
 * Set the active zone
 * @param id The ID of the zone to set as active
 * @param playerId The ID of the player who owns the zone
 * @param isActive Whether the zone is active
 */
export const activateZone = (id: string, playerId: string, isActive: boolean = true) => (dispatch: AppDispatch) => {
    const activeZone: ActiveZone = {
        id,
        playerId,
        isActive,
    };
    dispatch(setActiveZone(activeZone));
};

/**
 * Clear all active zones
 */
export const deactivateAllZones = () => (dispatch: AppDispatch) => {
    dispatch(clearActiveZones());
};

/**
 * Open a modal
 * @param type The type of modal to open
 * @param data The data to pass to the modal
 */
export const showModal = (type: string, data: any = null) => (dispatch: AppDispatch) => {
    dispatch(openModal({ type, data }));
};

/**
 * Close the current modal
 */
export const hideModal = () => (dispatch: AppDispatch) => {
    dispatch(closeModal());
};

/**
 * Update user preferences
 * @param preferences The preferences to update
 */
export const updateUserPreferences = (preferences: {
    cardSize?: 'small' | 'medium' | 'large';
    showCardDetails?: boolean;
    autoPassTurn?: boolean;
    soundEnabled?: boolean;
    animationsEnabled?: boolean;
    theme?: 'light' | 'dark' | 'system';
    cardBackStyle?: string;
}) => (dispatch: AppDispatch) => {
    dispatch(updatePreferences(preferences));

    // If theme is updated, apply it to the document
    if (preferences.theme) {
        if (preferences.theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', preferences.theme);
        }
    }
};

/**
 * Reset user preferences to defaults
 */
export const resetUserPreferences = () => (dispatch: AppDispatch) => {
    dispatch(resetPreferences());

    // Reset theme to system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
};

/**
 * Set the loading state
 * @param isLoading Whether the app is loading
 */
export const setLoadingState = (isLoading: boolean) => (dispatch: AppDispatch) => {
    dispatch(setLoading(isLoading));
};

/**
 * Set the error state
 * @param error The error message, or null to clear the error
 */
export const setErrorState = (error: string | null) => (dispatch: AppDispatch) => {
    dispatch(setError(error));
};
