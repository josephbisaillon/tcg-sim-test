/**
 * This file contains the persistence service for saving and loading state.
 */

import {
    PersistenceConfig,
    PersistedState,
    RehydrationResult,
    PersistenceResult,
} from './persistenceTypes';
import { RootState } from '../../store';

/**
 * Default configuration for the persistence service
 */
const DEFAULT_CONFIG: Partial<PersistenceConfig> = {
    key: 'pokemon-tcg-simulator',
    version: 1,
    autoRehydrate: true,
    autoPersist: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    debounceTime: 1000,
};

/**
 * Service for persisting and rehydrating state
 */
class PersistenceService {
    private config: PersistenceConfig;
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private isPaused = false;

    /**
     * Create a new persistence service
     * @param config The configuration for the service
     */
    constructor(config: Partial<PersistenceConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config } as PersistenceConfig;

        // Ensure storage is available
        if (!this.config.storage && typeof window !== 'undefined') {
            this.config.storage = window.localStorage;
        }

        if (!this.config.storage) {
            console.warn('No storage engine provided and localStorage is not available');
        }
    }

    /**
     * Persist the state to storage
     * @param state The state to persist
     * @param key Optional key to use instead of the configured key
     * @returns A promise that resolves to the result of the persistence operation
     */
    async persist(state: Partial<RootState>, key?: string): Promise<PersistenceResult> {
        if (this.isPaused) {
            return {
                success: false,
                error: new Error('Persistence is paused'),
            };
        }

        const storageKey = key || this.config.key;

        try {
            // Apply whitelist/blacklist filtering
            let filteredState = { ...state };

            if (this.config.whitelist && this.config.whitelist.length > 0) {
                filteredState = Object.keys(filteredState).reduce((result, key) => {
                    if (this.config.whitelist!.includes(key as keyof RootState)) {
                        result[key as keyof RootState] = filteredState[key as keyof RootState];
                    }
                    return result;
                }, {} as Partial<RootState>);
            } else if (this.config.blacklist && this.config.blacklist.length > 0) {
                filteredState = Object.keys(filteredState).reduce((result, key) => {
                    if (!this.config.blacklist!.includes(key as keyof RootState)) {
                        result[key as keyof RootState] = filteredState[key as keyof RootState];
                    }
                    return result;
                }, {} as Partial<RootState>);
            }

            // Apply transform if provided
            if (this.config.transform) {
                filteredState = this.config.transform(filteredState);
            }

            // Create the persisted state object
            const persistedState: PersistedState = {
                version: this.config.version,
                timestamp: new Date().toISOString(),
                state: filteredState,
            };

            // Serialize and store the state
            const serializedState = this.config.serialize!(persistedState);
            this.config.storage!.setItem(storageKey, serializedState);

            return {
                success: true,
                key: storageKey,
                timestamp: persistedState.timestamp,
            };
        } catch (error) {
            console.error('Error persisting state:', error);
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }

    /**
     * Persist the state to storage with debouncing
     * @param state The state to persist
     * @param key Optional key to use instead of the configured key
     * @returns A promise that resolves to the result of the persistence operation
     */
    debouncedPersist(state: Partial<RootState>, key?: string): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.persist(state, key);
            this.debounceTimer = null;
        }, this.config.debounceTime);
    }

    /**
     * Rehydrate the state from storage
     * @param key Optional key to use instead of the configured key
     * @returns A promise that resolves to the result of the rehydration operation
     */
    async rehydrate(key?: string): Promise<RehydrationResult> {
        const storageKey = key || this.config.key;

        try {
            // Get the serialized state from storage
            const serializedState = this.config.storage!.getItem(storageKey);

            if (!serializedState) {
                return {
                    success: false,
                    error: new Error(`No state found for key: ${storageKey}`),
                };
            }

            // Deserialize the state
            const persistedState = this.config.deserialize!(serializedState) as PersistedState;

            // Check if migration is needed
            if (persistedState.version !== this.config.version && this.config.migrate) {
                persistedState.state = this.config.migrate(
                    persistedState.state,
                    persistedState.version
                );
            }

            // Apply transform if provided
            if (this.config.transformRehydrated) {
                persistedState.state = this.config.transformRehydrated(persistedState.state);
            }

            return {
                success: true,
                state: persistedState.state,
                version: persistedState.version,
                timestamp: persistedState.timestamp,
            };
        } catch (error) {
            console.error('Error rehydrating state:', error);
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }

    /**
     * Clear the persisted state from storage
     * @param key Optional key to use instead of the configured key
     * @returns A promise that resolves to true if the state was cleared successfully
     */
    async clear(key?: string): Promise<boolean> {
        const storageKey = key || this.config.key;

        try {
            this.config.storage!.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing persisted state:', error);
            return false;
        }
    }

    /**
     * Pause persistence
     */
    pause(): void {
        this.isPaused = true;
    }

    /**
     * Resume persistence
     */
    resume(): void {
        this.isPaused = false;
    }

    /**
     * Get the current configuration
     * @returns The current configuration
     */
    getConfig(): PersistenceConfig {
        return { ...this.config };
    }

    /**
     * Update the configuration
     * @param config The new configuration
     */
    updateConfig(config: Partial<PersistenceConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Check if persistence is paused
     * @returns Whether persistence is paused
     */
    isPersistencePaused(): boolean {
        return this.isPaused;
    }
}

// Create and export a singleton instance with default configuration
export const persistenceService = new PersistenceService(DEFAULT_CONFIG);

// Export the class for testing and custom instances
export default PersistenceService;
