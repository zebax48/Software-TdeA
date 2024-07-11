import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { auth } = useAuth();

  return auth.token ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default PrivateRoute;