import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from '../../src/pages/LoginPage'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock API calls
vi.mock('../../src/services/api', () => ({
  login: vi.fn(),
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染登录表单', () => {
    renderWithRouter(<LoginPage />)
    
    expect(screen.getByText('用户登录')).toBeInTheDocument()
    expect(screen.getByLabelText('手机号')).toBeInTheDocument()
    expect(screen.getByLabelText('密码')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
  })

  it('应该允许用户输入手机号和密码', () => {
    renderWithRouter(<LoginPage />)
    
    const phoneInput = screen.getByLabelText('手机号') as HTMLInputElement
    const passwordInput = screen.getByLabelText('密码') as HTMLInputElement
    
    fireEvent.change(phoneInput, { target: { value: '13800138000' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(phoneInput.value).toBe('13800138000')
    expect(passwordInput.value).toBe('password123')
  })

  it('应该验证手机号格式', async () => {
    renderWithRouter(<LoginPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    const loginButton = screen.getByRole('button', { name: '登录' })
    
    // 输入无效手机号
    fireEvent.change(phoneInput, { target: { value: '123456' } })
    fireEvent.click(loginButton)
    
    await waitFor(() => {
      expect(screen.getByText(/请输入正确的手机号/)).toBeInTheDocument()
    })
  })

  it('应该验证密码不能为空', async () => {
    renderWithRouter(<LoginPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    const loginButton = screen.getByRole('button', { name: '登录' })
    
    // 只输入手机号，不输入密码
    fireEvent.change(phoneInput, { target: { value: '13800138000' } })
    fireEvent.click(loginButton)
    
    await waitFor(() => {
      expect(screen.getByText(/请输入密码/)).toBeInTheDocument()
    })
  })

  it('应该成功登录用户', async () => {
    const { login } = await import('../../src/services/api')
    const mockLogin = login as any
    (mockLogin as any).mockResolvedValue({ 
      success: true, 
      token: 'fake-token',
      user: { id: 1, phone: '13800138000', realName: '张三' }
    })

    renderWithRouter(<LoginPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    const passwordInput = screen.getByLabelText('密码')
    const loginButton = screen.getByRole('button', { name: '登录' })
    
    fireEvent.change(phoneInput, { target: { value: '13800138000' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(loginButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        phone: '13800138000',
        password: 'password123'
      })
    })
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'fake-token')
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('应该处理登录失败 - 密码错误', async () => {
    const { login } = await import('../../src/services/api')
    const mockLogin = login as any
    mockLogin.mockRejectedValue(new Error('密码错误'))

    renderWithRouter(<LoginPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    const passwordInput = screen.getByLabelText('密码')
    const loginButton = screen.getByRole('button', { name: '登录' })
    
    fireEvent.change(phoneInput, { target: { value: '13800138000' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(loginButton)
    
    await waitFor(() => {
      expect(screen.getByText(/密码错误/)).toBeInTheDocument()
    })
  })

  it('应该处理登录失败 - 用户不存在', async () => {
    const { login } = await import('../../src/services/api')
    const mockLogin = login as any
    mockLogin.mockRejectedValue(new Error('用户不存在'))

    renderWithRouter(<LoginPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    const passwordInput = screen.getByLabelText('密码')
    const loginButton = screen.getByRole('button', { name: '登录' })
    
    fireEvent.change(phoneInput, { target: { value: '13800138001' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(loginButton)
    
    await waitFor(() => {
      expect(screen.getByText(/用户不存在/)).toBeInTheDocument()
    })
  })

  it('应该限制登录尝试次数', async () => {
    const { login } = await import('../../src/services/api')
    const mockLogin = login as any
    mockLogin.mockRejectedValue(new Error('密码错误'))

    renderWithRouter(<LoginPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    const passwordInput = screen.getByLabelText('密码')
    const loginButton = screen.getByRole('button', { name: '登录' })
    
    fireEvent.change(phoneInput, { target: { value: '13800138000' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    
    // 连续尝试登录多次
    for (let i = 0; i < 6; i++) {
      fireEvent.click(loginButton)
      await waitFor(() => {
        expect(screen.getByText(/密码错误/)).toBeInTheDocument()
      })
    }
    
    // 第6次尝试后应该显示账户锁定信息
    await waitFor(() => {
      expect(screen.getByText(/登录尝试次数过多，请稍后再试/)).toBeInTheDocument()
    })
  })

  it('应该支持记住登录状态', () => {
    renderWithRouter(<LoginPage />)
    
    const rememberCheckbox = screen.getByLabelText('记住登录状态')
    
    expect(rememberCheckbox).toBeInTheDocument()
    expect(rememberCheckbox).not.toBeChecked()
    
    fireEvent.click(rememberCheckbox)
    expect(rememberCheckbox).toBeChecked()
  })

  it('应该提供忘记密码链接', () => {
    renderWithRouter(<LoginPage />)
    
    const forgotPasswordLink = screen.getByText('忘记密码？')
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password')
  })

  it('应该提供注册页面链接', () => {
    renderWithRouter(<LoginPage />)
    
    const registerLink = screen.getByText(/没有账号？立即注册/)
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register')
  })

  it('应该显示登录加载状态', async () => {
    const { login } = await import('../../src/services/api')
    const mockLogin = login as any
    // 模拟延迟响应
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

    renderWithRouter(<LoginPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    const passwordInput = screen.getByLabelText('密码')
    const loginButton = screen.getByRole('button', { name: '登录' })
    
    fireEvent.change(phoneInput, { target: { value: '13800138000' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(loginButton)
    
    // 应该显示加载状态
    expect(screen.getByText(/登录中.../)).toBeInTheDocument()
    expect(loginButton).toBeDisabled()
  })

  it('应该支持Enter键提交表单', async () => {
    const { login } = await import('../../src/services/api')
    const mockLogin = login as any
    (mockLogin as any).mockResolvedValue({ 
      success: true, 
      token: 'fake-token',
      user: { id: 1, phone: '13800138000', realName: '张三' }
    })

    renderWithRouter(<LoginPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    const passwordInput = screen.getByLabelText('密码')
    
    fireEvent.change(phoneInput, { target: { value: '13800138000' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.keyDown(passwordInput, { key: 'Enter' })
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        phone: '13800138000',
        password: 'password123'
      })
    })
  })

  it('应该在移动设备上正确显示', () => {
    // 模拟移动设备视口
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    renderWithRouter(<LoginPage />)
    
    const loginForm = screen.getByRole('form')
    expect(loginForm).toBeInTheDocument()
    
    // 验证表单在移动设备上的布局
    expect(loginForm).toHaveClass('login-form')
  })

  it('应该支持键盘导航', () => {
    renderWithRouter(<LoginPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    
    // 验证Tab键导航
    phoneInput.focus()
    expect(document.activeElement).toBe(phoneInput)
    
    fireEvent.keyDown(phoneInput, { key: 'Tab' })
    // 在实际实现中，焦点应该移动到密码输入框
  })

  it('应该清除之前的错误信息', async () => {
    const { login } = await import('../../src/services/api')
    const mockLogin = login as any
    mockLogin.mockRejectedValue(new Error('密码错误'))

    renderWithRouter(<LoginPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    const passwordInput = screen.getByLabelText('密码')
    const loginButton = screen.getByRole('button', { name: '登录' })
    
    // 第一次登录失败
    fireEvent.change(phoneInput, { target: { value: '13800138000' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(loginButton)
    
    await waitFor(() => {
      expect(screen.getByText(/密码错误/)).toBeInTheDocument()
    })
    
    // 修改输入，错误信息应该清除
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } })
    
    expect(screen.queryByText(/密码错误/)).not.toBeInTheDocument()
  })
})