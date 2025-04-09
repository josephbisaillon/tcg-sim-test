/**
 * This file contains the Redux middleware for automatically persisting state.
 */

import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import { persistenceService } from './persistenceService';
import {
    PersistenceActionType,
    PersistenceAction,
    PersistAction,
    RehydrateAction,
    ClearAction,
} from './persistenceTypes';
import { RootState } from '../../store';

/**
 * Create a middleware for automatically persisting state
 * @param options Options for the middleware
 * @returns The middleware
 */
export const createPersistenceMiddleware = (options: {
    /**
     * Actions that should trigger persistence
     * If not provided, all actions will trigger persistence
     */
    persistOnActions?: string[];

    /**
     * Actions that should not trigger persistence
     * This is ignored if persistOnActions is provided
     */
    excludeActions?: string[];

    /**
     * Whether to persist the state after every action
     * Default: true
     */
    persistAfterEveryAction?: boolean;
}): Middleware => {
    const {
        persistOnActions,
        excludeActions = [],
        persistAfterEveryAction = true,
    } = options;

    return (store: MiddlewareAPI<Dispatch<AnyAction>, RootState>) =>
        (next: Dispatch<AnyAction>) =>
            (action: AnyAction) => {
                // Handle persistence actions
                if (isPersistenceAction(action)) {
                    return handlePersistenceAction(store, next, action);
                }

                // Process the action
                const result = next(action);

                // Check if we should persist the state
                const shouldPersist =
                    persistAfterEveryAction &&
                    !persistenceService.isPersistencePaused() &&
                    (persistOnActions
                        ? persistOnActions.includes(action.type)
                        : !excludeActions.includes(action.type));

                // Persist the state if needed
                if (shouldPersist) {
                    persistenceService.debouncedPersist(store.getState());
                }

                return result;
            };
};

/**
 * Check if an action is a persistence action
 * @param action The action to check
 * @returns Whether the action is a persistence action
 */
const isPersistenceAction = (action: AnyAction): action is PersistenceAction => {
    return Object.values(PersistenceActionType).includes(action.type as PersistenceActionType);
};

/**
 * Handle a persistence action
 * @param store The Redux store
 * @param next The next dispatch function
 * @param action The persistence action
 * @returns The result of the action
 */
const handlePersistenceAction = (
    store: MiddlewareAPI<Dispatch<AnyAction>, RootState>,
    next: Dispatch<AnyAction>,
    action: PersistenceAction
) => {
    // Process the action first
    const result = next(action);

    // Handle the action based on its type
    switch (action.type) {
        case PersistenceActionType.PERSIST:
            handlePersistAction(store, action as PersistAction);
            break;
        case PersistenceActionType.REHYDRATE:
            handleRehydrateAction(store, action as RehydrateAction);
            break;
        case PersistenceActionType.CLEAR:
            handleClearAction(action as ClearAction);
            break;
        case PersistenceActionType.PAUSE:
            persistenceService.pause();
            break;
        case PersistenceActionType.RESUME:
            persistenceService.resume();
            break;
    }

    return result;
};

/**
 * Handle a persist action
 * @param store The Redux store
 * @param action The persist action
 */
const handlePersistAction = (
    store: MiddlewareAPI<Dispatch<AnyAction>, RootState>,
    action: PersistAction
) => {
    persistenceService.persist(store.getState(), action.payload?.key);
};

/**
 * Handle a rehydrate action
 * @param store The Redux store
 * @param action The rehydrate action
 */
const handleRehydrateAction = async (
    store: MiddlewareAPI<Dispatch<AnyAction>, RootState>,
    action: RehydrateAction
) => {
    const result = await persistenceService.rehydrate(action.payload?.key);

    if (result.success && result.state) {
        // Dispatch actions to update the store with the rehydrated state
        Object.entries(result.state).forEach(([sliceName, sliceState]) => {
            store.dispatch({
                type: `${sliceName}/rehydrate`,
                payload: sliceState,
            });
        });
    }
};

/**
 * Handle a clear action
 * @param action The clear action
 */
const handleClearAction = (action: ClearAction) => {
    persistenceService.clear(action.payload?.key);
};

/**
 * Create a persistence middleware with default options
 */
export const persistenceMiddleware = createPersistenceMiddleware({
    // Exclude persistence actions to avoid infinite loops
    excludeActions: Object.values(PersistenceActionType),
    persistAfterEveryAction: true,
});

/**
 * Action creator for persisting the state
 * @param key Optional key to use instead of the configured key
 * @returns The persist action
 */
export const persistState = (key?: string): PersistAction => ({
    type: PersistenceActionType.PERSIST,
    payload: key ? { key } : undefined,
});

/**
 * Action creator for rehydrating the state
 * @param key Optional key to use instead of the configured key
 * @returns The rehydrate action
 */
export const rehydrateState = (key?: string): RehydrateAction => ({
    type: PersistenceActionType.REHYDRATE,
    payload: key ? { key } : undefined,
});

/**
 * Action creator for clearing the persisted state
 * @param key Optional key to use instead of the configured key
 * @returns The clear action
 */
export const clearPersistedState = (key?: string): ClearAction => ({
    type: PersistenceActionType.CLEAR,
    payload: key ? { key } : undefined,
});

/**
 * Action creator for pausing persistence
 * @returns The pause action
 */
export const pausePersistence = () => ({
    type: PersistenceActionType.PAUSE,
});

/**
 * Action creator for resuming persistence
 * @returns The resume action
 */
export const resumePersistence = () => ({
    type: PersistenceActionType.RESUME,
});
