import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider, type AuthProviderProps } from "react-oidc-context";
import "./index.css";

// Configuración de Cognito (User Pool de us-east-1). Los valores salen de variables de entorno:
// .env.local en tu máquina, o Environment Variables en Vercel.
const cognitoAuthConfig: AuthProviderProps = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  // Funciona igual en local (http://localhost:5173) y en producción (URL de Vercel).
  // Esa URL debe estar registrada en las Callback URLs del App client de Cognito.
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "email openid phone",
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
