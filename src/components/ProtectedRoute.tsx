import { Navigate } from "react-router-dom";
import { useAuth, UserType } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  allowedType: UserType;
}

export default function ProtectedRoute({ children, allowedType }: Props) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (user.type !== allowedType) {
    return <Navigate to={user.type === "visitor" ? "/map" : "/dashboard"} replace />;
  }
  return <>{children}</>;
}
