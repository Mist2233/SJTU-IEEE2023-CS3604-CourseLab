import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import './UserCenter.css';

const UserCenterLayout = () => {
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="user-center-container">
      <div className="user-center-sidebar">
        <Sidebar />
      </div>
      <div className="user-center-content">
        <Outlet />
      </div>
    </div>
  );
};

export default UserCenterLayout;
