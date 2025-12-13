import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

import { SudokuProvider } from "./context/SudokuContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider> 
      <SudokuProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SudokuProvider>
    </AuthProvider>
  </React.StrictMode>
);
