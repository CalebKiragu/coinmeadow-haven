
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import priceReducer from './slices/priceSlice';
import transactionReducer from './slices/transactionSlice';
import notificationReducer from './slices/notificationSlice';

// Create a transform to handle non-serializable values like BigInt
const bigIntTransform = createTransform(
  // transform state going to storage
  (inboundState, key) => {
    if (key === 'price') {
      // Create a copy of the state and convert BigInt to strings
      return JSON.parse(JSON.stringify(inboundState, (_, value) => 
        typeof value === 'bigint' ? value.toString() : value
      ));
    }
    return inboundState;
  },
  // transform state coming from storage
  (outboundState, key) => {
    return outboundState;
  }
);

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'wallet', 'price', 'transaction', 'notification'],
  transforms: [bigIntTransform],
};

const rootReducer = combineReducers({
  auth: authReducer,
  wallet: walletReducer,
  price: priceReducer,
  transaction: transactionReducer,
  notification: notificationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['price.prices'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
