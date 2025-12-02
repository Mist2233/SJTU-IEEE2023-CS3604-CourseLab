import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || '请求失败'
    if (status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject({ message, status, code: status === 401 ? 'UNAUTHORIZED' : undefined })
  }
)

// 认证相关API
export const sendVerificationCode = async (phone) => {
  try {
    const response = await api.post('/auth/send-code', { phone })
    return response
  } catch (error) {
    console.error('发送验证码失败:', error)
    throw error
  }
}

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData)
    return response
  } catch (error) {
    console.error('注册失败:', error)
    throw error
  }
}

export const login = async ({ identifier, password }) => {
  try {
    const response = await api.post('/auth/login', { identifier, password })
    return response
  } catch (error) {
    console.error('登录失败:', error)
    throw error
  }
}

// 列车查询API
export const searchTrains = async (searchParams) => {
  // TODO: 实现列车查询API调用
  return api.get('/trains/search', { params: searchParams })
}

// 订单相关API
export const createOrder = async (orderData) => {
  // TODO: 实现创建订单API调用
  return api.post('/orders', orderData)
}

export const getOrderDetails = async (orderId) => {
  // TODO: 实现获取订单详情API调用
  return api.get(`/orders/${orderId}`)
}

export const cancelOrder = async (orderId) => {
  // TODO: 实现取消订单API调用
  return api.post(`/orders/${orderId}/cancel`)
}

export const refundOrder = async (orderId) => {
  return api.post(`/orders/${orderId}/refund`)
}

export const getUserOrders = async (userId, params = {}) => {
  // TODO: 实现获取用户订单列表API调用
  return api.get(`/orders/user/${userId}`, { params })
}

// 支付相关API
export const initiatePayment = async (paymentData) => {
  // TODO: 实现发起支付API调用
  return api.post('/payments/initiate', paymentData)
}

export const handlePaymentCallback = async (callbackData) => {
  // TODO: 实现支付回调处理API调用
  return api.post('/payments/callback', callbackData)
}

// 忘记密码相关API
export const sendForgotCode = async ({ recipient, idNumber }) => {
  try {
    const response = await api.post('/auth/forgot/send-code', { recipient, idNumber })
    return response
  } catch (error) {
    console.error('忘记密码发送验证码失败:', error)
    throw error
  }
}

export const resetPassword = async ({ recipient, idNumber, verificationCode, newPassword }) => {
  try {
    const response = await api.post('/auth/forgot/reset', { recipient, idNumber, verificationCode, newPassword })
    return response
  } catch (error) {
    console.error('忘记密码重置失败:', error)
    throw error
  }
}

// Mock Data for Passengers
let mockPassengers = [
  { id: 1, name: '毛天宇', certType: '居民身份证', certNo: '331003199901014419', phone: '18900008785', type: '成人', status: '已通过', isDefault: false },
  { id: 2, name: '李晓华', certType: '居民身份证', certNo: '330302198812120842', phone: '15300001235', type: '成人', status: '已通过', isDefault: false },
  { id: 3, name: '王建国', certType: '居民身份证', certNo: '330302197505050755', phone: '18600000226', type: '成人', status: '已通过', isDefault: false },
  { id: 4, name: '陈小明', certType: '居民身份证', certNo: '330302201006010314', phone: '13700003810', type: '儿童', status: '已通过', isDefault: false },
];

// Mock API functions for Passengers
export const getPassengers = async (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockPassengers];
      if (params?.name) {
        filtered = filtered.filter(p => p.name.includes(params.name));
      }
      resolve({ data: { passengers: filtered } });
    }, 300);
  });
};

export const addPassenger = async (passenger) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = Math.max(...mockPassengers.map(p => p.id), 0) + 1;
      const newPassenger = { ...passenger, id: newId, status: '已通过' };
      mockPassengers.push(newPassenger);
      resolve({ data: newPassenger });
    }, 300);
  });
};

export const updatePassenger = async (id, passenger) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockPassengers = mockPassengers.map(p => p.id === id ? { ...p, ...passenger } : p);
      resolve({ data: { ...passenger, id } });
    }, 300);
  });
};

export const deletePassenger = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockPassengers = mockPassengers.filter(p => p.id !== id);
      resolve({ success: true });
    }, 300);
  });
};

export default api
