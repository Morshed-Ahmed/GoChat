import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import useAuthRedirect from "../firebase/useAuthRedirect";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = () => {
  useAuthRedirect();
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
