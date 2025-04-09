/**
 * This file contains type definitions for the persistence layer.
 */

import { RootState } from '../../store';

/**
 * Configuration for the persistence service
 */
export interface PersistenceConfig {
    /**
     * The key to use for storing the state in localStorage
     */
    key: string;

    /**
     * The version of the persistence format
     * This is used to handle migrations between versions
     */
    version: number;

    /**
     * The parts of the state to persist
     * If not provided, the entire state will be persisted
     */
    whitelist?: (keyof RootState)[];

    /**
     * The parts of the state to not persist
     * If not provided, the entire state will be persisted
     * This is ignored if whitelist is provided
     */
    blacklist?: (keyof RootState)[];

    /**
     * Whether to automatically rehydrate the state when the app loads
     * Default: true
     */
    autoRehydrate?: boolean;

    /**
     * Whether to automatically persist the state when it changes
     * Default: true
     */
    autoPersist?: boolean;

    /**
     * The storage engine to use
     * Default: localStorage
     */
    storage?: Storage;

    /**
     * The serializer to use for converting the state to a string
     * Default: JSON.stringify
     */
    serialize?: (state: any) => string;

    /**
     * The deserializer to use for converting a string to state
     * Default: JSON.parse
     */
    deserialize?: (serializedState: string) => any;

    /**
     * The debounce time in milliseconds for persisting the state
     * This is used to avoid persisting the state too frequently
     * Default: 1000 (1 second)
     */
    debounceTime?: number;

    /**
     * A function to transform the state before persisting it
     * This is useful for removing sensitive data or reducing the size of the persisted state
     */
    transform?: (state: Partial<RootState>) => Partial<RootState>;

    /**
     * A function to transform the state after rehydrating it
     * This is useful for migrating between versions or adding default values
     */
    transformRehydrated?: (state: Partial<RootState>) => Partial<RootState>;

    /**
     * A function to migrate the state from one version to another
     * This is called when the version in the persisted state doesn't match the current version
     */
    migrate?: (state: any, version: number) => Partial<RootState>;
}

/**
 * The persisted state with metadata
 */
export interface PersistedState<T = any> {
    /**
     * The version of the persistence format
     */
    version: number;

    /**
     * The timestamp when the state was persisted
     */
    timestamp: string;

    /**
     * The actual state data
     */
    state: T;
}

/**
 * The result of a rehydration operation
 */
export interface RehydrationResult {
    /**
     * Whether the rehydration was successful
     */
    success: boolean;

    /**
     * The rehydrated state, if successful
     */
    state?: Partial<RootState>;

    /**
     * The error that occurred, if unsuccessful
     */
    error?: Error;

    /**
     * The version of the persisted state, if available
     */
    version?: number;

    /**
     * The timestamp of the persisted state, if available
     */
    timestamp?: string;
}

/**
 * The result of a persistence operation
 */
export interface PersistenceResult {
    /**
     * Whether the persistence was successful
     */
    success: boolean;

    /**
     * The error that occurred, if unsuccessful
     */
    error?: Error;

    /**
     * The key that was used to persist the state
     */
    key?: string;

    /**
     * The timestamp when the state was persisted
     */
    timestamp?: string;
}

/**
 * The actions that can be dispatched to the persistence middleware
 */
export enum PersistenceActionType {
    PERSIST = 'persistence/PERSIST',
    REHYDRATE = 'persistence/REHYDRATE',
    CLEAR = 'persistence/CLEAR',
    PAUSE = 'persistence/PAUSE',
    RESUME = 'persistence/RESUME',
}

/**
 * The action to persist the state
 */
export interface PersistAction {
    type: PersistenceActionType.PERSIST;
    payload?: {
        key?: string;
    };
}

/**
 * The action to rehydrate the state
 */
export interface RehydrateAction {
    type: PersistenceActionType.REHYDRATE;
    payload?: {
        key?: string;
    };
}

/**
 * The action to clear the persisted state
 */
export interface ClearAction {
    type: PersistenceActionType.CLEAR;
    payload?: {
        key?: string;
    };
}

/**
 * The action to pause persistence
 */
export interface PauseAction {
    type: PersistenceActionType.PAUSE;
}

/**
 * The action to resume persistence
 */
export interface ResumeAction {
    type: PersistenceActionType.RESUME;
}

/**
 * The union of all persistence actions
 */
export type PersistenceAction =
    | PersistAction
    | RehydrateAction
    | ClearAction
    | PauseAction
    | ResumeAction;
