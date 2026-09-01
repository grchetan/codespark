import { useNavigate, useLocation, type NavigateFunction, useRoutes } from "react-router-dom";
import { useEffect } from "react";
import routes from "./config";
import { useMaintenance } from "@/context/MaintenanceContext";
import MaintenanceScreen from "@/components/feature/MaintenanceScreen";
import AdminMaintenanceBanner from "@/components/feature/AdminMaintenanceBanner";

let navigateResolver: (navigate: ReturnType<typeof useNavigate>) => void;

declare global {
  interface Window {
    REACT_APP_NAVIGATE: ReturnType<typeof useNavigate>;
  }
}

export const navigatePromise = new Promise<NavigateFunction>((resolve) => {
  navigateResolver = resolve;
});

export function AppRoutes() {
  const element = useRoutes(routes);
  const navigate = useNavigate();
  const location = useLocation();
  const { isMaintenance, adminBypass } = useMaintenance();

  useEffect(() => {
    window.REACT_APP_NAVIGATE = navigate;
    navigateResolver(window.REACT_APP_NAVIGATE);
  });

  // If maintenance is active and user is NOT admin bypass:
  // Allow /login and /admin route access so admin can authenticate
  const isAuthRoute = location.pathname.startsWith('/login') || location.pathname.startsWith('/admin');

  if (isMaintenance && !adminBypass && !isAuthRoute) {
    return <MaintenanceScreen />;
  }

  return (
    <>
      <AdminMaintenanceBanner />
      {element}
    </>
  );
}
