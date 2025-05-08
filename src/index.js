import React from "react";
import ReactDOM from "react-dom/client"; // <- note the '/client'
import App from "./App";
import "./index.css";
import "react-alice-carousel/lib/alice-carousel.css";
import CryptoContext from "./CryptoContext";
import { Provider } from "react-redux";
import store from "./store";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <CryptoContext>
        <App />
      </CryptoContext>
    </Provider>
  </React.StrictMode>
);
