import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, MobileOutlined, MailOutlined, NotificationOutlined } from '@ant-design/icons';
import './AccountSecurityPage.css';

const AccountSecurityPage = () => {
  const navigate = useNavigate();

  const securityItems = [
    {
      key: 'password',
      icon: <LockOutlined className="security-icon lock" />,
      title: '登录密码',
      desc: '建议您定期更改密码以保护账户安全',
      action: () => navigate('/user/security/password')
    },
    {
      key: 'phone',
      icon: <MobileOutlined className="security-icon phone" />,
      title: '手机核验',
      desc: '使用手机接收铁路客户服务信息',
      action: () => alert('功能开发中')
    },
    {
      key: 'email',
      icon: <MailOutlined className="security-icon email" />,
      title: '安全邮箱',
      desc: '使用邮箱接收铁路客户服务信息',
      action: () => alert('功能开发中')
    },
    {
      key: 'notification',
      icon: <NotificationOutlined className="security-icon notification" />,
      title: '通知设置',
      desc: '设置通知方式',
      action: () => alert('功能开发中')
    }
  ];

  return (
    <div className="account-security-container">
      <div className="security-list">
        {securityItems.map(item => (
          <div key={item.key} className="security-item">
            <div className="item-left">
              {item.icon}
              <span className="item-title">{item.title}</span>
            </div>
            <div className="item-middle">
              {item.desc}
            </div>
            <div className="item-right">
              <button className="action-btn" onClick={item.action}>修改</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountSecurityPage;
