
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import priceReducer from './slices/priceSlice';
import transactionReducer from './slices/transactionSlice';
import notificationReducer from './slices/notificationSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'wallet', 'price', 'transaction', 'notification'], // added notification
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
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
