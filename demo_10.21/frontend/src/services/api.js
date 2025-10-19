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
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data?.message || error.message)
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

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials)
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

export default api