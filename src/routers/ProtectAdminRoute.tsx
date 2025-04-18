import { useAuthStore } from "@/stores/auth";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectAdminRoute = () => {
  const { auth } = useAuthStore();
  const isAdmin = auth.userInfo.role === "admin";
  return isAdmin ? <Outlet /> : <Navigate to="/login" />;
};
