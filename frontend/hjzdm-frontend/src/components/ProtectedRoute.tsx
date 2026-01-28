import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // トークンがない場合はログインページにリダイレクト
    return <Navigate to="/login" replace />;
  }
  
  // トークンがある場合は子要素をレンダリング
  return children;
};

export default ProtectedRoute;