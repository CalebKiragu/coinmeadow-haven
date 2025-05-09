import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import walletReducer from "./slices/walletSlice";
import web3Reducer from "./slices/web3Slice";
import priceReducer from "./slices/priceSlice";
import transactionReducer from "./slices/transactionSlice";
import notificationReducer from "./slices/notificationSlice";
import { fullTransform } from "./transformer";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "wallet", "web3", "price", "transaction", "notification"],
  transforms: [fullTransform],
};

const rootReducer = combineReducers({
  auth: authReducer,
  wallet: walletReducer,
  web3: web3Reducer,
  price: priceReducer,
  transaction: transactionReducer,
  notification: notificationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      // Ignore redux-persist actions
      ignoredActions: [
        "persist/PERSIST",
        "persist/REHYDRATE",
        "persist/REGISTER",
      ],
      // Ignore specific paths in action payload/state
      ignoredActionPaths: [
        "meta.arg",
        "payload.timestamp",
        "payload.updatedAt",
      ],
    },
  });

export const store = configureStore({
  reducer: persistedReducer,
  middleware,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
