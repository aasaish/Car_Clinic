import React from "react";
import { Navigate } from "react-router-dom";



// Public routes only (no login required)
export const PublicRoute = ({ user, children }) => {
  return !user ? children : <Navigate to="/" />;
};

// Admin-only routes
export const AdminRoute = ({ user, isAdmin, children }) => {
  return user && isAdmin ? children : <Navigate to="/" />;
};

// Mechanic-only routes
export const MechanicRoute = ({ user, isMechanic, children }) => {
    
  return user && isMechanic ? children : <Navigate to="/" />;
};

// Regular users only (not admin or mechanic)
export const UserOnlyRoute = ({ user, isAdmin, isMechanic, children }) => {
  return user && !isAdmin && !isMechanic ? children : <Navigate to="/" />;
};
