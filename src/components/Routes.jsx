import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function PrivateRoute({ children }) {
  const auth = useAuth();
  if (!auth.isAuthed) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const auth = useAuth();
  if (!auth.isAuthed) return <Navigate to="/login" replace />;
  if (!auth.isAdmin) return <Navigate to="/" replace />;
  return children;
}
