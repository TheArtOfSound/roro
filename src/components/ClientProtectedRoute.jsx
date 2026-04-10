import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ClientProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif", color: "#6b6560",
      }}>
        Loading...
      </div>
    );
  }

  if (!session) return <Navigate to="/client/login" replace />;

  return <Outlet />;
}
