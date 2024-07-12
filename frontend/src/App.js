import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Recover from './Recover';
import Dashboard from './Dashboard';
import AdminUsers from './AdminUsers';
import AdminPrograms from './components/Programs/AdminPrograms';
import { AuthProvider, AuthContext } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import EditUser from './components/Users/EditUser';
import EditProgram from './components/Programs/EditProgram';
import CreateProgram from './components/Programs/CreateProgram';
import ListRA from './components/RA/ListRA';
import CreateRA from './components/RA/CreateRA';
import EditRA from './components/RA/EditRA';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recover" element={<Recover />} />
          <Route path="/dashboard" element={<PrivateRoute component={ Dashboard } />} />
          <Route path="/users" element={<PrivateRoute component={ AdminUsers } />} />
          <Route path="/edit-user/:username" element={<PrivateRoute component={ EditUser } />} />
          <Route path="/programas" element={<PrivateRoute component={ AdminPrograms } />} />
          <Route path="/crear-programa" element={<PrivateRoute component={ CreateProgram } />} />
          <Route path="/edit-program/:programId" element={<PrivateRoute component={ EditProgram } />} />
          <Route path="/ra" element={<PrivateRoute component={ ListRA } />} />
          <Route path="/crear-ra" element={<PrivateRoute component={ CreateRA } />} />
          <Route path="/editar-ra/:raId" element={<PrivateRoute component={ EditRA } />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;