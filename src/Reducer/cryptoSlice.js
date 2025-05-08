// src/features/crypto/cryptoSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  coins: {},      // Stores live coin data keyed by symbol
  coinList: [],   // Optional: stores list of supported coins
};

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    updateCoinPrice: (state, action) => {
      const { symbol, price, volume, timestamp } = action.payload;

      // Log the data being updated
      console.log("Updating price for symbol:", symbol, price);

      state.coins[symbol] = { price, volume, timestamp };
    },
    setCoinList: (state, action) => {
      state.coinList = action.payload;
    },
  },
});

export const { updateCoinPrice, setCoinList } = cryptoSlice.actions;
export default cryptoSlice.reducer;
