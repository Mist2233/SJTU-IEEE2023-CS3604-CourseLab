import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../services/api';

const ChangePasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const { oldPassword, newPassword } = values;
    setLoading(true);
    try {
      await changePassword({ oldPassword, newPassword });
      message.success('密码修改成功，请重新登录');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      // 错误已经在拦截器或服务层处理过一部分，或者是通过 message 显示
      // 如果 api.js 抛出错误对象，我们在这里捕获
      message.error(error.message || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container" style={{ padding: '30px', background: '#fff', borderRadius: '4px', minHeight: '400px' }}>
      <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '18px', color: '#333', margin: 0 }}>修改密码</h2>
      </div>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: '400px' }}
      >
        <Form.Item
          label="原密码"
          name="oldPassword"
          rules={[{ required: true, message: '请输入原密码' }]}
        >
          <Input.Password placeholder="请输入原密码" size="large" />
        </Form.Item>

        <Form.Item
          label="新密码"
          name="newPassword"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码长度至少6位' }
          ]}
        >
          <Input.Password placeholder="请输入新密码（6-20位字符）" size="large" />
        </Form.Item>

        <Form.Item
          label="确认新密码"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请再次输入新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="请再次输入新密码" size="large" />
        </Form.Item>

        <Form.Item style={{ marginTop: '30px' }}>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            确认修改
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChangePasswordPage;
