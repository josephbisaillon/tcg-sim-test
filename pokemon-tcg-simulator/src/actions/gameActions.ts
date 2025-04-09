/**
 * This file contains action creators for game-related actions.
 * These action creators are used to dispatch actions to the Redux store.
 */

import { AppDispatch } from '../store';
import {
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
} from '../store/slices/gameSlice';

import {
    Card,
    Player,
    GamePhase,
    GameAction,
    GameActionType,
    CardMovementData,
    ZoneType,
    CoinFlipData,
    DieRollData,
    DamageData,
    SpecialConditionData,
    AttackData,
    AbilityData,
} from '../types';

import { v4 as uuidv4 } from 'uuid';

/**
 * Initialize a new game
 * @param gameId The ID of the game
 */
export const initializeGame = (gameId: string) => (dispatch: AppDispatch) => {
    dispatch(setGameId(gameId));
};

/**
 * Set the players for the game
 * @param players The players in the game
 */
export const initializePlayers = (players: Player[]) => (dispatch: AppDispatch) => {
    dispatch(setPlayers(players));
};

/**
 * Start the game
 */
export const beginGame = () => (dispatch: AppDispatch) => {
    dispatch(startGame());
};

/**
 * End the game
 * @param winnerId The ID of the winning player, or null for a draw
 */
export const finishGame = (winnerId: string | null) => (dispatch: AppDispatch) => {
    dispatch(endGame(winnerId));
};

/**
 * Move a card from one zone to another
 * @param data The card movement data
 */
export const moveCardAction = (data: CardMovementData) => (dispatch: AppDispatch) => {
    dispatch(moveCard(data));

    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.MOVE_CARD,
        playerId: data.sourcePlayerId,
        timestamp: new Date().toISOString(),
        data,
        undoable: true,
    };

    dispatch(addAction(action));
};

/**
 * Draw a card from the deck
 * @param playerId The ID of the player drawing the card
 */
export const drawCardAction = (playerId: string) => (dispatch: AppDispatch) => {
    dispatch(drawCard({ playerId }));

    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.DRAW_CARD,
        playerId,
        timestamp: new Date().toISOString(),
        data: { playerId },
        undoable: true,
    };

    dispatch(addAction(action));
};

/**
 * Shuffle a player's deck
 * @param playerId The ID of the player whose deck is being shuffled
 */
export const shuffleDeckAction = (playerId: string) => (dispatch: AppDispatch) => {
    dispatch(shuffleDeck({ playerId }));

    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.SHUFFLE_DECK,
        playerId,
        timestamp: new Date().toISOString(),
        data: { playerId },
        undoable: false, // Shuffling is not undoable
    };

    dispatch(addAction(action));
};

/**
 * Set the current player
 * @param playerId The ID of the current player
 */
export const setActivePlayer = (playerId: string) => (dispatch: AppDispatch) => {
    dispatch(setCurrentPlayer(playerId));
};

/**
 * Set the current game phase
 * @param phase The current game phase
 */
export const setGamePhase = (phase: GamePhase) => (dispatch: AppDispatch) => {
    dispatch(setPhase(phase));

    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.CHANGE_PHASE,
        playerId: '', // No specific player for phase change
        timestamp: new Date().toISOString(),
        data: { phase },
        undoable: true,
    };

    dispatch(addAction(action));
};

/**
 * Advance to the next turn
 */
export const advanceTurn = () => (dispatch: AppDispatch) => {
    dispatch(nextTurn());

    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.END_TURN,
        playerId: '', // Will be filled in by the reducer
        timestamp: new Date().toISOString(),
        data: {},
        undoable: true,
    };

    dispatch(addAction(action));
};

/**
 * Use a player's VSTAR power
 * @param playerId The ID of the player using the VSTAR power
 */
export const useVStarPower = (playerId: string) => (dispatch: AppDispatch) => {
    dispatch(useVStar());

    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.USE_VSTAR,
        playerId,
        timestamp: new Date().toISOString(),
        data: { playerId },
        undoable: true,
    };

    dispatch(addAction(action));
};

/**
 * Use a player's GX attack
 * @param playerId The ID of the player using the GX attack
 */
export const useGXAttack = (playerId: string) => (dispatch: AppDispatch) => {
    dispatch(useGX());

    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.USE_GX,
        playerId,
        timestamp: new Date().toISOString(),
        data: { playerId },
        undoable: true,
    };

    dispatch(addAction(action));
};

/**
 * Flip a coin
 * @param playerId The ID of the player flipping the coin
 * @param reason The reason for the coin flip
 */
export const flipCoin = (playerId: string, reason?: string) => (dispatch: AppDispatch) => {
    // Simulate a coin flip
    const result: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails';

    const data: CoinFlipData = {
        result,
        reason,
    };

    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.FLIP_COIN,
        playerId,
        timestamp: new Date().toISOString(),
        data,
        undoable: false, // Coin flips are not undoable
    };

    dispatch(addAction(action));

    return result; // Return the result for immediate use
};

/**
 * Roll a die
 * @param playerId The ID of the player rolling the die
 * @param sides The number of sides on the die
 * @param reason The reason for the die roll
 */
export const rollDie = (playerId: string, sides: number = 6, reason?: string) => (dispatch: AppDispatch) => {
    // Simulate a die roll
    const result = Math.floor(Math.random() * sides) + 1;

    const data: DieRollData = {
        result,
        sides,
        reason,
    };

    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.ROLL_DIE,
        playerId,
        timestamp: new Date().toISOString(),
        data,
        undoable: false, // Die rolls are not undoable
    };

    dispatch(addAction(action));

    return result; // Return the result for immediate use
};

/**
 * Apply damage to a card
 * @param data The damage data
 */
export const applyDamage = (data: DamageData) => (dispatch: AppDispatch) => {
    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.APPLY_DAMAGE,
        playerId: '', // Will be determined by the source card
        timestamp: new Date().toISOString(),
        data,
        undoable: true,
    };

    dispatch(addAction(action));
};

/**
 * Apply a special condition to a card
 * @param data The special condition data
 */
export const applySpecialCondition = (data: SpecialConditionData) => (dispatch: AppDispatch) => {
    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.APPLY_SPECIAL_CONDITION,
        playerId: '', // Will be determined by the source card
        timestamp: new Date().toISOString(),
        data,
        undoable: true,
    };

    dispatch(addAction(action));
};

/**
 * Remove a special condition from a card
 * @param data The special condition data
 */
export const removeSpecialCondition = (data: SpecialConditionData) => (dispatch: AppDispatch) => {
    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.REMOVE_SPECIAL_CONDITION,
        playerId: '', // Will be determined by the card
        timestamp: new Date().toISOString(),
        data,
        undoable: true,
    };

    dispatch(addAction(action));
};

/**
 * Use an attack
 * @param data The attack data
 */
export const useAttack = (data: AttackData) => (dispatch: AppDispatch) => {
    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.USE_ATTACK,
        playerId: '', // Will be determined by the attacker
        timestamp: new Date().toISOString(),
        data,
        undoable: true,
    };

    dispatch(addAction(action));
};

/**
 * Use an ability
 * @param data The ability data
 */
export const useAbility = (data: AbilityData) => (dispatch: AppDispatch) => {
    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.USE_ABILITY,
        playerId: '', // Will be determined by the card
        timestamp: new Date().toISOString(),
        data,
        undoable: true,
    };

    dispatch(addAction(action));
};

/**
 * Take a prize card
 * @param playerId The ID of the player taking the prize card
 * @param position The position of the prize card (0-5)
 */
export const takePrize = (playerId: string, position: number) => (dispatch: AppDispatch) => {
    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.TAKE_PRIZE,
        playerId,
        timestamp: new Date().toISOString(),
        data: { playerId, position },
        undoable: true,
    };

    dispatch(addAction(action));
};

/**
 * Undo the last action
 */
export const undoAction = () => (dispatch: AppDispatch) => {
    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.UNDO,
        playerId: '', // No specific player for undo
        timestamp: new Date().toISOString(),
        data: {},
        undoable: false, // Undo actions are not undoable
    };

    dispatch(addAction(action));
};

/**
 * Redo the last undone action
 */
export const redoAction = () => (dispatch: AppDispatch) => {
    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.REDO,
        playerId: '', // No specific player for redo
        timestamp: new Date().toISOString(),
        data: {},
        undoable: false, // Redo actions are not undoable
    };

    dispatch(addAction(action));
};

/**
 * Concede the game
 * @param playerId The ID of the player conceding
 */
export const concedeGame = (playerId: string) => (dispatch: AppDispatch) => {
    // Create a game action for the history
    const action: GameAction = {
        id: uuidv4(),
        type: GameActionType.CONCEDE,
        playerId,
        timestamp: new Date().toISOString(),
        data: { playerId },
        undoable: false, // Conceding is not undoable
    };

    dispatch(addAction(action));

    // End the game with the other player as the winner
    // This assumes a 2-player game
    dispatch(finishGame(playerId));
};
