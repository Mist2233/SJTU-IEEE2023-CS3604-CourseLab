import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { maskIDCard, maskPhone, maskEmail } from '../../utils/format';
import './UserInfo.css';

const UserInfoPage = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const res = await api.get('/auth/me');
        setInfo(res?.data);
      } catch (e) {
        console.error('Failed to fetch user info', e);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  if (loading) return <div className="loading-text">加载中...</div>;
  if (!info) return <div className="error-text">未获取到用户信息</div>;

  return (
    <div className="user-info-container">
      <div className="info-header">
        <h2>基本信息</h2>
      </div>
      
      <div className="info-section">
        <div className="info-row">
          <div className="info-label"><span className="required"></span> 用户名：</div>
          <div className="info-value">{info.userId}</div>
        </div>
        <div className="info-row">
          <div className="info-label"><span className="required"></span> 姓名：</div>
          <div className="info-value">{info.realName}</div>
        </div>
        <div className="info-row">
          <div className="info-label">国家/地区：</div>
          <div className="info-value">中国China</div>
        </div>
        <div className="info-row">
          <div className="info-label"><span className="required"></span> 证件类型：</div>
          <div className="info-value">居民身份证</div>
        </div>
        <div className="info-row">
          <div className="info-label"><span className="required"></span> 证件号码：</div>
          <div className="info-value">{maskIDCard(info.idNumber)}</div>
        </div>
        <div className="info-row">
          <div className="info-label">核验状态：</div>
          <div className="info-value status-verified">已通过</div>
        </div>
      </div>

      <div className="info-section-divider"></div>

      <div className="info-section-header">
        <h3>联系方式</h3>
        <button className="edit-btn">编辑</button>
      </div>
      <div className="info-section">
        <div className="info-row">
          <div className="info-label"><span className="required"></span> 手机号：</div>
          <div className="info-value">
            {maskPhone(info.phone)}
            <span className="status-text">已通过核验</span>
          </div>
        </div>
        <div className="info-row">
          <div className="info-label">邮箱：</div>
          <div className="info-value">
            {maskEmail(info.email) || '未填写'}
            {info.email && <span className="status-text">已通过核验</span>}
          </div>
        </div>
      </div>

      <div className="info-section-divider"></div>

      <div className="info-section-header">
        <h3>附加信息</h3>
        <button className="edit-btn">编辑</button>
      </div>
      <div className="info-section">
        <div className="info-row">
          <div className="info-label"><span className="required"></span> 优惠(待)类型：</div>
          <div className="info-value">学生</div>
        </div>
      </div>

      <div className="info-section-divider"></div>
      
      <div className="info-section-header">
         <h3>学生资质查询</h3>
         <div className="action-buttons">
             <button className="action-btn primary">刷新</button>
             <button className="action-btn">查询</button>
         </div>
      </div>
      <div className="info-description">
        学生资质查询服务，提供查询本人的学生购票资质、购票优惠区间及年度剩余优惠票购票次数。
      </div>
    </div>
  );
};

export default UserInfoPage;
