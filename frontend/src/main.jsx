import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: "14px", fontSize: "13px", fontWeight: 600 },
      }} />
    </AuthProvider>
  </React.StrictMode>,
);
