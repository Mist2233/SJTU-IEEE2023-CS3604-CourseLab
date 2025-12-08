import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Modal, Form, Checkbox, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusCircleFilled, CheckCircleFilled } from '@ant-design/icons';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../services/api';
import { maskPhone } from '../../utils/format';
import './AddressPage.css';

const AddressPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form] = Form.useForm();

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await getAddresses({ keyword });
      setAddresses(res?.data?.addresses || []);
    } catch (e) {
      message.error('获取地址列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSearch = () => {
    fetchAddresses();
  };

  const handleAdd = () => {
    setEditingAddress(null);
    form.resetFields();
    form.setFieldsValue({ isDefault: false });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingAddress(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id);
      message.success('删除成功');
      fetchAddresses();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      message.success('已设为默认地址');
      fetchAddresses();
    } catch (e) {
      message.error('设置默认失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingAddress) {
        await updateAddress(editingAddress.id, values);
        message.success('修改成功');
      } else {
        await addAddress(values);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchAddresses();
    } catch (e) {
      // 表单校验失败或接口错误
    }
  };

  const columns = [
    { title: '序号', key: 'index', width: 80, render: (t, r, i) => i + 1 },
    { title: '收货人', dataIndex: 'name', key: 'name', width: 120 },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 160, render: (text) => maskPhone(text) },
    { 
      title: '地址', 
      key: 'address', 
      render: (_, r) => `${r.province || ''}${r.city || ''}${r.district || ''}${r.addressLine || ''}`,
    },
    { title: '邮编', dataIndex: 'postcode', key: 'postcode', width: 120 },
    { 
      title: '默认', 
      dataIndex: 'isDefault', 
      key: 'isDefault', 
      width: 100,
      render: (val) => val ? (<span className="default-flag"><CheckCircleFilled /> 默认</span>) : <span style={{ color: '#aaa' }}>否</span>
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <div>
          <DeleteOutlined className="action-icon delete" onClick={() => handleDelete(record.id)} />
          <EditOutlined className="action-icon edit" onClick={() => handleEdit(record)} />
          {!record.isDefault && (
            <Button size="small" type="link" onClick={() => handleSetDefault(record.id)}>设为默认</Button>
          )}
        </div>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  return (
    <div className="address-page-container">
      <div className="search-bar">
        <Input
          placeholder="输入收货人/手机号/地址关键词"
          style={{ width: 280 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
        />
        <Button type="primary" onClick={handleSearch}>查询</Button>
      </div>

      <div className="toolbar">
        <div className="toolbar-btn add" onClick={handleAdd}>
          <PlusCircleFilled style={{ color: '#52c41a' }} /> 添加
        </div>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={addresses}
        rowKey="id"
        loading={loading}
        pagination={false}
        bordered
        className="address-table"
      />

      <Modal
        title={editingAddress ? '编辑地址' : '添加地址'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={640}
      >
        <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item name="name" label="收货人" rules={[{ required: true, message: '请输入收货人' }]}>
            <Input placeholder="请输入收货人姓名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="province" label="省/直辖市" rules={[{ required: true, message: '请输入省/直辖市' }]}>
            <Input placeholder="例如：上海市/浙江省" />
          </Form.Item>
          <Form.Item name="city" label="城市" rules={[{ required: true, message: '请输入城市' }]}>
            <Input placeholder="例如：杭州市/上海市" />
          </Form.Item>
          <Form.Item name="district" label="区/县" rules={[{ required: true, message: '请输入区/县' }]}>
            <Input placeholder="例如：闵行区/西湖区" />
          </Form.Item>
          <Form.Item name="addressLine" label="详细地址" rules={[{ required: true, message: '请输入详细地址' }]}>
            <Input placeholder="街道、楼号、门牌等" />
          </Form.Item>
          <Form.Item name="postcode" label="邮编">
            <Input placeholder="可选" />
          </Form.Item>
          <Form.Item name="isDefault" label="设为默认" valuePropName="checked">
            <Checkbox />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddressPage;

