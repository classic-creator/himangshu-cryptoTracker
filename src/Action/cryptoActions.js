// src/features/crypto/cryptoActions.js

// Action to update coin price from WebSocket data
export const updateCoinPrice = (coinData) => ({
    type: "UPDATE_COIN_PRICE",
    payload: coinData,
  });
  
  // Action to set the list of coins when initially fetched or if needed
  export const setCoinList = (coinList) => ({
    type: "SET_COIN_LIST",
    payload: coinList,
  });
  