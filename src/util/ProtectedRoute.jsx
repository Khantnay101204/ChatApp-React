import { Navigate } from "react-router-dom";
import isTokenValid from "./isTokenValid";
function ProtectedRoute({ children }) {
  if (!isTokenValid()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default ProtectedRoute;
