import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './UserCenter.css';

const UserCenterLayout = () => {
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
