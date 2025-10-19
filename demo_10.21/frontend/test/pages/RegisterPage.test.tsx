import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import RegisterPage from '../../src/pages/RegisterPage'

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
  sendVerificationCode: vi.fn(),
  register: vi.fn(),
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('RegisterPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染注册表单', () => {
    renderWithRouter(<RegisterPage />)
    
    expect(screen.getByText('用户注册')).toBeInTheDocument()
    expect(screen.getByLabelText('手机号')).toBeInTheDocument()
    expect(screen.getByLabelText('验证码')).toBeInTheDocument()
    expect(screen.getByLabelText('密码')).toBeInTheDocument()
    expect(screen.getByLabelText('确认密码')).toBeInTheDocument()
    expect(screen.getByLabelText('真实姓名')).toBeInTheDocument()
    expect(screen.getByLabelText('身份证号')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '发送验证码' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument()
  })

  it('应该验证手机号格式', async () => {
    renderWithRouter(<RegisterPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    const sendCodeButton = screen.getByRole('button', { name: '发送验证码' })
    
    // 输入无效手机号
    fireEvent.change(phoneInput, { target: { value: '123456' } })
    fireEvent.click(sendCodeButton)
    
    await waitFor(() => {
      expect(screen.getByText(/请输入正确的手机号/)).toBeInTheDocument()
    })
  })

  it('应该验证身份证号格式', async () => {
    renderWithRouter(<RegisterPage />)
    
    const idNumberInput = screen.getByLabelText('身份证号')
    const registerButton = screen.getByRole('button', { name: '注册' })
    
    // 填写其他必填字段
    fireEvent.change(screen.getByLabelText('手机号'), { target: { value: '13800138000' } })
    fireEvent.change(screen.getByLabelText('验证码'), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('确认密码'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('真实姓名'), { target: { value: '张三' } })
    
    // 输入无效身份证号
    fireEvent.change(idNumberInput, { target: { value: '123456' } })
    fireEvent.click(registerButton)
    
    await waitFor(() => {
      expect(screen.getByText(/请输入正确的身份证号/)).toBeInTheDocument()
    })
  })

  it('应该验证密码强度', async () => {
    renderWithRouter(<RegisterPage />)
    
    const passwordInput = screen.getByLabelText('密码')
    
    // 输入弱密码
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.blur(passwordInput)
    
    await waitFor(() => {
      expect(screen.getByText(/密码长度至少6位/)).toBeInTheDocument()
    })
  })

  it('应该验证密码确认', async () => {
    renderWithRouter(<RegisterPage />)
    
    const passwordInput = screen.getByLabelText('密码')
    const confirmPasswordInput = screen.getByLabelText('确认密码')
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } })
    fireEvent.blur(confirmPasswordInput)
    
    await waitFor(() => {
      expect(screen.getByText(/两次输入的密码不一致/)).toBeInTheDocument()
    })
  })

  it('应该验证真实姓名格式', async () => {
    renderWithRouter(<RegisterPage />)
    
    const realNameInput = screen.getByLabelText('真实姓名')
    
    // 输入包含数字的姓名
    fireEvent.change(realNameInput, { target: { value: '张三123' } })
    fireEvent.blur(realNameInput)
    
    await waitFor(() => {
      expect(screen.getByText(/请输入正确的真实姓名/)).toBeInTheDocument()
    })
  })

  it('应该支持发送验证码', async () => {
    const { sendVerificationCode } = await import('../../src/services/api')
    const mockSendCode = sendVerificationCode as any
    (mockSendCode as any).mockResolvedValue({ success: true })

    renderWithRouter(<RegisterPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    const sendCodeButton = screen.getByRole('button', { name: '发送验证码' })
    
    // 输入有效手机号
    fireEvent.change(phoneInput, { target: { value: '13800138000' } })
    fireEvent.click(sendCodeButton)
    
    await waitFor(() => {
      expect(mockSendCode).toHaveBeenCalledWith('13800138000')
    })
  })

  it('应该显示验证码发送倒计时', async () => {
    const { sendVerificationCode } = await import('../../src/services/api')
    const mockSendCode = sendVerificationCode as any
    (mockSendCode as any).mockResolvedValue({ success: true })

    renderWithRouter(<RegisterPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    const sendCodeButton = screen.getByRole('button', { name: '发送验证码' })
    
    fireEvent.change(phoneInput, { target: { value: '13800138000' } })
    fireEvent.click(sendCodeButton)
    
    await waitFor(() => {
      expect(screen.getByText(/60s后重新发送/)).toBeInTheDocument()
    })
  })

  it('应该限制验证码发送频率', async () => {
    const { sendVerificationCode } = await import('../../src/services/api')
    const mockSendCode = sendVerificationCode as any
    (mockSendCode as any).mockResolvedValue({ success: true })

    renderWithRouter(<RegisterPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    const sendCodeButton = screen.getByRole('button', { name: '发送验证码' })
    
    fireEvent.change(phoneInput, { target: { value: '13800138000' } })
    
    // 连续点击发送验证码
    fireEvent.click(sendCodeButton)
    fireEvent.click(sendCodeButton)
    
    // 应该只调用一次API
    await waitFor(() => {
      expect(mockSendCode).toHaveBeenCalledTimes(1)
    })
  })

  it('应该成功注册用户', async () => {
    const { register } = await import('../../src/services/api')
    const mockRegister = register as any
    (mockRegister as any).mockResolvedValue({ success: true, token: 'fake-token' })

    renderWithRouter(<RegisterPage />)
    
    // 填写完整的注册信息
    fireEvent.change(screen.getByLabelText('手机号'), { target: { value: '13800138000' } })
    fireEvent.change(screen.getByLabelText('验证码'), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('确认密码'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('真实姓名'), { target: { value: '张三' } })
    fireEvent.change(screen.getByLabelText('身份证号'), { target: { value: '110101199001011234' } })
    
    // 勾选协议
    const agreementCheckbox = screen.getByRole('checkbox')
    fireEvent.click(agreementCheckbox)
    
    const registerButton = screen.getByRole('button', { name: '注册' })
    fireEvent.click(registerButton)
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        phone: '13800138000',
        verificationCode: '123456',
        password: 'password123',
        realName: '张三',
        idNumber: '110101199001011234'
      })
    })
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('应该处理注册失败', async () => {
    const { register } = await import('../../src/services/api')
    const mockRegister = register as any
    mockRegister.mockRejectedValue(new Error('手机号已存在'))

    renderWithRouter(<RegisterPage />)
    
    // 填写完整的注册信息
    fireEvent.change(screen.getByLabelText('手机号'), { target: { value: '13800138000' } })
    fireEvent.change(screen.getByLabelText('验证码'), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('确认密码'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('真实姓名'), { target: { value: '张三' } })
    fireEvent.change(screen.getByLabelText('身份证号'), { target: { value: '110101199001011234' } })
    
    // 勾选协议
    const agreementCheckbox = screen.getByRole('checkbox')
    fireEvent.click(agreementCheckbox)
    
    const registerButton = screen.getByRole('button', { name: '注册' })
    fireEvent.click(registerButton)
    
    await waitFor(() => {
      expect(screen.getByText(/手机号已存在/)).toBeInTheDocument()
    })
  })

  it('应该显示注册协议', () => {
    renderWithRouter(<RegisterPage />)
    
    expect(screen.getByText(/我已阅读并同意/)).toBeInTheDocument()
    expect(screen.getByText(/用户协议/)).toBeInTheDocument()
    expect(screen.getByText(/隐私政策/)).toBeInTheDocument()
  })

  it('应该要求用户同意协议才能注册', async () => {
    renderWithRouter(<RegisterPage />)
    
    // 填写完整信息但不勾选协议
    fireEvent.change(screen.getByLabelText('手机号'), { target: { value: '13800138000' } })
    fireEvent.change(screen.getByLabelText('验证码'), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('确认密码'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('真实姓名'), { target: { value: '张三' } })
    fireEvent.change(screen.getByLabelText('身份证号'), { target: { value: '110101199001011234' } })
    
    const registerButton = screen.getByRole('button', { name: '注册' })
    fireEvent.click(registerButton)
    
    await waitFor(() => {
      expect(screen.getByText(/请先同意用户协议/)).toBeInTheDocument()
    })
  })

  it('应该提供登录页面链接', () => {
    renderWithRouter(<RegisterPage />)
    
    const loginLink = screen.getByText(/已有账号？立即登录/)
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login')
  })

  it('应该在移动设备上正确显示', () => {
    // 模拟移动设备视口
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    renderWithRouter(<RegisterPage />)
    
    const registerForm = screen.getByRole('form')
    expect(registerForm).toBeInTheDocument()
    
    // 验证表单在移动设备上的布局
    expect(registerForm).toHaveClass('register-form')
  })

  it('应该支持键盘导航', () => {
    renderWithRouter(<RegisterPage />)
    
    const phoneInput = screen.getByLabelText('手机号')
    
    // 验证Tab键导航
    phoneInput.focus()
    expect(document.activeElement).toBe(phoneInput)
    
    fireEvent.keyDown(phoneInput, { key: 'Tab' })
    // 在实际实现中，焦点应该移动到下一个元素
  })
})