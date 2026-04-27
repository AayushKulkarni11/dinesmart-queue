import { Navigate, useLocation } from "react-router-dom";
import { useAuth, Role } from "@/context/AuthContext";
import { ReactNode } from "react";

export const ProtectedRoute = ({
  children,
  role,
}: {
  children: ReactNode;
  role?: Role;
}) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role)
    return <Navigate to="/" replace />;

  return <>{children}</>;
};
