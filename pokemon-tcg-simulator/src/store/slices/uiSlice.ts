import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for the UI state
interface SelectedCard {
    id: string;
    zoneId: string;
    playerId: string;
}

interface ActiveZone {
    id: string;
    playerId: string;
    isActive: boolean;
}

interface ModalState {
    type: string | null;
    isOpen: boolean;
    data: any;
}

interface Preferences {
    cardSize: 'small' | 'medium' | 'large';
    showCardDetails: boolean;
    autoPassTurn: boolean;
    soundEnabled: boolean;
    animationsEnabled: boolean;
    theme: 'light' | 'dark' | 'system';
    cardBackStyle: string;
}

interface UIState {
    selectedCard: SelectedCard | null;
    activeZones: ActiveZone[];
    modalState: ModalState;
    preferences: Preferences;
    isLoading: boolean;
    error: string | null;
}

// Define the initial state
const initialState: UIState = {
    selectedCard: null,
    activeZones: [],
    modalState: {
        type: null,
        isOpen: false,
        data: null,
    },
    preferences: {
        cardSize: 'medium',
        showCardDetails: true,
        autoPassTurn: false,
        soundEnabled: true,
        animationsEnabled: true,
        theme: 'system',
        cardBackStyle: 'default',
    },
    isLoading: false,
    error: null,
};

// Create the UI slice
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // Card selection actions
        selectCard: (state, action: PayloadAction<SelectedCard>) => {
            state.selectedCard = action.payload;
        },
        deselectCard: (state) => {
            state.selectedCard = null;
        },

        // Zone activation actions
        setActiveZone: (state, action: PayloadAction<ActiveZone>) => {
            const index = state.activeZones.findIndex(
                (zone) => zone.id === action.payload.id && zone.playerId === action.payload.playerId
            );
            if (index >= 0) {
                state.activeZones[index] = action.payload;
            } else {
                state.activeZones.push(action.payload);
            }
        },
        clearActiveZones: (state) => {
            state.activeZones = [];
        },

        // Modal actions
        openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
            state.modalState = {
                type: action.payload.type,
                isOpen: true,
                data: action.payload.data || null,
            };
        },
        closeModal: (state) => {
            state.modalState = {
                type: null,
                isOpen: false,
                data: null,
            };
        },

        // Preference actions
        updatePreferences: (state, action: PayloadAction<Partial<Preferences>>) => {
            state.preferences = {
                ...state.preferences,
                ...action.payload,
            };
        },
        resetPreferences: (state) => {
            state.preferences = initialState.preferences;
        },

        // Loading state actions
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

// Export actions and reducer
export const {
    selectCard,
    deselectCard,
    setActiveZone,
    clearActiveZones,
    openModal,
    closeModal,
    updatePreferences,
    resetPreferences,
    setLoading,
    setError,
} = uiSlice.actions;

export default uiSlice.reducer;
