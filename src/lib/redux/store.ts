
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
    return JSON.parse(JSON.stringify(inboundState, (_, value) => 
      typeof value === 'bigint' ? value.toString() : value
    ));
  },
  // transform state coming from storage
  (outboundState, key) => {
    if (key === 'transaction') {
      // If we're dealing with transactions, convert timestamp strings back to bigint
      const transformedState = {...outboundState};
      if (transformedState.transactions) {
        transformedState.transactions = transformedState.transactions.map(tx => ({
          ...tx,
          timestamp: typeof tx.timestamp === 'string' ? BigInt(tx.timestamp) : tx.timestamp,
          updatedAt: typeof tx.updatedAt === 'string' ? BigInt(tx.updatedAt) : tx.updatedAt
        }));
      }
      return transformedState;
    }
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
        ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'payload.updatedAt'],
        // Ignore these paths in the state
        ignoredPaths: [
          'transaction.transactions.timestamp', 
          'transaction.transactions.updatedAt',
          'price.prices'
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
