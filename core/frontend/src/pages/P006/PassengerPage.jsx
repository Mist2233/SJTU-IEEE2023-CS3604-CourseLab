import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Form, Select, message, Space, Popconfirm } from 'antd';
import { 
  PlusCircleFilled, 
  DeleteFilled, 
  EditOutlined, 
  DeleteOutlined,
  IdcardOutlined,
  MobileOutlined,
  SearchOutlined,
  CheckCircleFilled
} from '@ant-design/icons';
import { getPassengers, addPassenger, updatePassenger, deletePassenger } from '../../services/api';
import { maskIDCard, maskPhone } from '../../utils/format';
import './PassengerPage.css';

const { Option } = Select;

const PassengerPage = () => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState(null);
  const [form] = Form.useForm();

  const fetchPassengers = async () => {
    setLoading(true);
    try {
      const res = await getPassengers({ page: 1, pageSize: 100 });
      // Filter locally if needed since backend pagination list doesn't support name search yet
      let list = res.data.passengers || [];
      if (searchName) {
        list = list.filter(p => p.name.includes(searchName));
      }
      setPassengers(list);
    } catch (error) {
      const msg = error?.message || '获取乘车人列表失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassengers();
  }, []);

  const handleSearch = () => {
    fetchPassengers();
  };

  const handleAdd = () => {
    setEditingPassenger(null);
    form.resetFields();
    form.setFieldsValue({
      cert_type: '居民身份证',
      passenger_type: '成人'
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingPassenger(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletePassenger(id);
      message.success('删除成功');
      fetchPassengers();
    } catch (error) {
      const msg = error?.message || '删除失败';
      message.error(msg);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的乘车人');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 位乘车人吗？`,
      onOk: async () => {
        try {
          // 模拟批量删除，实际应调用批量删除接口
          for (const id of selectedRowKeys) {
            await deletePassenger(id);
          }
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          fetchPassengers();
        } catch (error) {
          const msg = error?.message || '批量删除失败';
          message.error(msg);
        }
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingPassenger) {
        await updatePassenger(editingPassenger.id, values);
        message.success('修改成功');
      } else {
        await addPassenger(values);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchPassengers();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      const fallback = editingPassenger ? '修改失败' : '添加失败';
      const msg = error?.message || fallback;
      message.error(msg);
    }
  };

  const columns = [
    {
      title: '序号',
      key: 'index',
      render: (text, record, index) => index + 1,
      width: 80,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '证件类型',
      dataIndex: 'cert_type',
      key: 'cert_type',
      width: 150,
    },
    {
      title: '证件号码',
      dataIndex: 'id_number',
      key: 'id_number',
      render: (text) => maskIDCard(text),
      width: 200,
    },
    {
      title: '手机/电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => maskPhone(text),
      width: 150,
    },
    {
      title: '核验状态',
      key: 'status',
      render: () => (
        <div className="status-verified">
          <IdcardOutlined />
          <MobileOutlined />
          <span>已通过</span>
        </div>
      ),
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
            <DeleteOutlined className="action-icon delete" />
          </Popconfirm>
          <EditOutlined className="action-icon edit" onClick={() => handleEdit(record)} />
        </div>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  return (
    <div className="passenger-page-container">
      {/* 1. 查询区 */}
      <div className="search-bar">
        <Input 
          placeholder="请输入乘客姓名" 
          style={{ width: 200 }} 
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          allowClear
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          查询
        </Button>
      </div>

      {/* 2. 工具栏 */}
      <div className="toolbar">
        <div className="toolbar-btn add" onClick={handleAdd}>
          <PlusCircleFilled style={{ color: '#52c41a' }} /> 添加
        </div>
        <div className="toolbar-btn delete" onClick={handleBatchDelete}>
          <DeleteFilled style={{ color: '#ff4d4f' }} /> 批量删除
        </div>
      </div>

      {/* 3. 表格 */}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={passengers}
        rowKey="id"
        loading={loading}
        pagination={false}
        className="passenger-table"
        bordered
      />

      {/* 4. 新增/编辑 Modal */}
      <Modal
        title={editingPassenger ? "编辑乘车人" : "添加乘车人"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="cert_type"
            label="证件类型"
            rules={[{ required: true, message: '请选择证件类型' }]}
          >
            <Select>
              <Option value="居民身份证">居民身份证</Option>
              <Option value="护照">护照</Option>
              <Option value="港澳台居民居住证">港澳台居民居住证</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="id_number"
            label="证件号码"
            rules={[{ required: true, message: '请输入证件号码' }]}
          >
            <Input placeholder="请输入证件号码" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="passenger_type"
            label="旅客类型"
            rules={[{ required: true, message: '请选择旅客类型' }]}
          >
            <Select>
              <Option value="成人">成人</Option>
              <Option value="儿童">儿童</Option>
              <Option value="学生">学生</Option>
              <Option value="残疾军人">残疾军人</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PassengerPage;
