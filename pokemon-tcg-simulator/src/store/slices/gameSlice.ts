import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    Card,
    Player,
    GamePhase,
    GameAction,
    GameActionType,
    ZoneType,
    CardMovementData,
} from '../../types';

// Define the game state interface
interface GameState {
    gameId: string | null;
    players: Player[];
    zones: {
        [key: string]: {
            id: string;
            type: ZoneType;
            playerId: string;
            cards: string[]; // Card IDs
        };
    };
    cards: {
        [key: string]: Card;
    };
    turn: {
        currentPlayer: string;
        phase: GamePhase;
        turnNumber: number;
    };
    actions: GameAction[]; // History of actions
    status: {
        isVStarUsed: boolean;
        isGXUsed: boolean;
        gameStarted: boolean;
        gameEnded: boolean;
        winner: string | null;
    };
}

// Define the initial state
const initialState: GameState = {
    gameId: null,
    players: [],
    zones: {},
    cards: {},
    turn: {
        currentPlayer: '',
        phase: GamePhase.DRAW,
        turnNumber: 0,
    },
    actions: [],
    status: {
        isVStarUsed: false,
        isGXUsed: false,
        gameStarted: false,
        gameEnded: false,
        winner: null,
    },
};

// Create the game slice
const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        // Game setup actions
        setGameId: (state, action: PayloadAction<string>) => {
            state.gameId = action.payload;
        },
        setPlayers: (state, action: PayloadAction<Player[]>) => {
            state.players = action.payload;
        },
        startGame: (state) => {
            state.status.gameStarted = true;
            state.turn.turnNumber = 1;
        },
        endGame: (state, action: PayloadAction<string | null>) => {
            state.status.gameEnded = true;
            state.status.winner = action.payload;
        },

        // Card movement actions
        moveCard: (
            state,
            action: PayloadAction<CardMovementData>
        ) => {
            // Implementation will be added later
        },
        drawCard: (state, action: PayloadAction<{ playerId: string }>) => {
            // Implementation will be added later
        },
        shuffleDeck: (state, action: PayloadAction<{ playerId: string }>) => {
            // Implementation will be added later
        },

        // Turn management actions
        setCurrentPlayer: (state, action: PayloadAction<string>) => {
            state.turn.currentPlayer = action.payload;
        },
        setPhase: (
            state,
            action: PayloadAction<GamePhase>
        ) => {
            state.turn.phase = action.payload;
        },
        nextTurn: (state) => {
            state.turn.turnNumber += 1;
            // Additional logic for turn transition will be added later
        },

        // Status actions
        useVStar: (state) => {
            state.status.isVStarUsed = true;
        },
        useGX: (state) => {
            state.status.isGXUsed = true;
        },

        // Action history
        addAction: (state, action: PayloadAction<GameAction>) => {
            state.actions.push(action.payload);
        },
    },
});

// Export actions and reducer
export const {
    setGameId,
    setPlayers,
    startGame,
    endGame,
    moveCard,
    drawCard,
    shuffleDeck,
    setCurrentPlayer,
    setPhase,
    nextTurn,
    useVStar,
    useGX,
    addAction,
} = gameSlice.actions;

export default gameSlice.reducer;
