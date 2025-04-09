import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import slices
import gameReducer from './slices/gameSlice';
import uiReducer from './slices/uiSlice';
import connectionReducer from './slices/connectionSlice';
import chatReducer from './slices/chatSlice';

// Import middleware
import { persistenceMiddleware, rehydrateState } from '../services/persistence';

/**
 * Configure the Redux store with all reducers and middleware
 */
export const store = configureStore({
    reducer: {
        game: gameReducer,
        ui: uiReducer,
        connection: connectionReducer,
        chat: chatReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(persistenceMiddleware),
    // Enable Redux DevTools in development
    devTools: process.env.NODE_ENV !== 'production',
});

// Rehydrate the state from localStorage when the app loads
// We'll handle this in a separate initialization function to avoid TypeScript errors
setTimeout(() => {
    store.dispatch({ type: 'persistence/REHYDRATE' });
}, 0);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
