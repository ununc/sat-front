import { useAuthStore } from "@/stores/auth";
import { Navigate, Outlet } from "react-router-dom";

export const ProTEctAccess = () => {
  const { auth } = useAuthStore();
  return auth.accessToken ? <Outlet /> : <Navigate to="/login" />;
};
