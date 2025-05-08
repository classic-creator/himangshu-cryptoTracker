
// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import cryptoReducer from "./Reducer/cryptoSlice";

const store = configureStore({
  reducer: {
    crypto: cryptoReducer,
  },
});

export default store;