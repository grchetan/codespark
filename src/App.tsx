import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "./context/AuthContext";
import { MaintenanceProvider } from "./context/MaintenanceContext";
import { SavedProvider } from "./context/SavedContext";

declare const __BASE_PATH__: string;

function App() {
  const basename = typeof __BASE_PATH__ !== 'undefined' ? __BASE_PATH__ : '/';

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <MaintenanceProvider>
          <SavedProvider>
            <BrowserRouter basename={basename}>
              <AppRoutes />
            </BrowserRouter>
          </SavedProvider>
        </MaintenanceProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
