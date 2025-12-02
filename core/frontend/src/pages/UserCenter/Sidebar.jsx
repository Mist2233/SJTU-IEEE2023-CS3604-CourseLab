import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './UserCenter.css';

const Sidebar = () => {
  const location = useLocation();
  
  // Define the menu structure based on the user's request
  const menuItems = [
    {
      id: 'orders',
      title: '订单中心',
      type: 'group',
      children: [
        { title: '火车票订单', path: '/user/orders' },
        { title: '候补订单', path: '', disabled: true },
        { title: '计次·定期票', path: '', disabled: true },
        { title: '约号订单', path: '', disabled: true },
        { title: '雪具快运订单', path: '', disabled: true },
        { title: '餐饮·特产', path: '', disabled: true },
        { title: '保险订单', path: '', disabled: true },
        { title: '电子发票', path: '', disabled: true },
      ]
    },
    {
      id: 'my-tickets',
      title: '本人车票',
      type: 'link',
      path: '',
      disabled: true
    },
    {
      id: 'member-center',
      title: '会员中心',
      type: 'link',
      path: '',
      disabled: true
    },
    {
      id: 'personal-info',
      title: '个人信息',
      type: 'group',
      children: [
        { title: '查看个人信息', path: '/user/info' },
        { title: '账号安全', path: '/user/password' },
        { title: '手机核验', path: '', disabled: true },
        { title: '账号注销', path: '', disabled: true },
      ]
    },
    {
      id: 'frequent-info',
      title: '常用信息管理',
      type: 'group',
      children: [
        { title: '乘车人', path: '/user/passengers' },
        { title: '地址管理', path: '', disabled: true },
      ]
    },
    {
      id: 'service',
      title: '温馨服务',
      type: 'group',
      children: [
        { title: '重点旅客预约', path: '', disabled: true },
        { title: '遗失物品查找', path: '', disabled: true },
        { title: '服务查询', path: '', disabled: true },
      ]
    },
    {
      id: 'complaints',
      title: '投诉和建议',
      type: 'group',
      children: [
        { title: '投诉', path: '', disabled: true },
        { title: '建议', path: '', disabled: true },
      ]
    }
  ];

  // Helper to check if a path is active
  const isActive = (path) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-breadcrumb">
        当前位置：个人中心
      </div>
      <div className="sidebar-box">
        <div className="sidebar-main-header">
          <Link to="/user/dashboard">个人中心</Link>
        </div>
        <div className="sidebar-menu-list">
          {menuItems.map((item) => (
            <div key={item.id} className="sidebar-item-wrapper">
              {item.type === 'group' ? (
                <div className="sidebar-group">
                  <div className="sidebar-group-header">
                    <span className="group-title">{item.title}</span>
                    <span className="group-toggle-icon"></span>
                  </div>
                  <ul className="sidebar-sub-menu">
                    {item.children.map((subItem, index) => (
                      <li key={index}>
                        {subItem.disabled ? (
                          <span 
                            className="sidebar-link disabled"
                            data-tooltip="功能开发中"
                          >
                            {subItem.title}
                          </span>
                        ) : (
                          <Link 
                            to={subItem.path} 
                            className={`sidebar-link ${isActive(subItem.path) ? 'active' : ''}`}
                          >
                            {subItem.title}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="sidebar-direct-link">
                  {item.disabled ? (
                     <span 
                       className="sidebar-group-header-link disabled"
                       data-tooltip="功能开发中"
                     >
                       {item.title}
                     </span>
                  ) : (
                    <Link to={item.path} className="sidebar-group-header-link">
                      {item.title}
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
