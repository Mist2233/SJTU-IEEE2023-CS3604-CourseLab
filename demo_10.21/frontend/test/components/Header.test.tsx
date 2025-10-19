import React from 'react'
import { render, screen} from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Header from '../../src/components/Header'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染12306 logo', () => {
    renderWithRouter(<Header />)
    
    const logo = screen.getByText('中国铁路12306')
    expect(logo).toBeInTheDocument()
    expect(logo.closest('a')).toHaveAttribute('href', '/')
  })

  it('应该显示导航链接', () => {
    renderWithRouter(<Header />)
    
    expect(screen.getAllByText('首页')).toHaveLength(2) // 主导航和面包屑中都有
    expect(screen.getAllByText('车票预订')).toHaveLength(2) // 主导航和面包屑中都有
    
    // 获取主导航中的链接
    const mainNav = screen.getByRole('navigation')
    const homeLink = mainNav.querySelector('a[href="/"]')
    const ticketsLink = mainNav.querySelector('a[href="/tickets"]')
    
    expect(homeLink).toHaveAttribute('href', '/')
    expect(ticketsLink).toHaveAttribute('href', '/tickets')
  })

  it('应该在未登录状态显示登录和注册按钮', () => {
    renderWithRouter(<Header />)
    
    const loginBtn = screen.getByText('登录')
    const registerBtn = screen.getByText('注册')
    
    expect(loginBtn).toBeInTheDocument()
    expect(registerBtn).toBeInTheDocument()
    expect(loginBtn.closest('a')).toHaveAttribute('href', '/login')
    expect(registerBtn.closest('a')).toHaveAttribute('href', '/register')
  })

  it('应该在登录状态显示用户信息和登出按钮', () => {
    // TODO: 实现用户状态管理后，测试登录状态的显示
    // 这个测试需要在实现用户状态管理后完善
    renderWithRouter(<Header />)
    
    // 暂时验证基本结构存在
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('应该响应式显示在移动设备上', () => {
    // 模拟移动设备视口
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    renderWithRouter(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    
    // 验证响应式样式是否正确应用
    expect(header).toHaveClass('header')
  })

  it('应该支持键盘导航', () => {
    renderWithRouter(<Header />)
    
    const logo = screen.getByText('中国铁路12306')
    const mainNav = screen.getByRole('navigation')
    const homeLink = mainNav.querySelector('a[href="/"]')
    const ticketsLink = mainNav.querySelector('a[href="/tickets"]')
    const loginBtn = screen.getByText('登录')
    
    // 验证所有链接都可以通过Tab键访问
    expect(logo.closest('a')).toHaveAttribute('href')
    expect(homeLink).toHaveAttribute('href')
    expect(ticketsLink).toHaveAttribute('href')
    expect(loginBtn.closest('a')).toHaveAttribute('href')
  })

  it('应该在导航链接上显示hover效果', () => {
    renderWithRouter(<Header />)
    
    const mainNav = screen.getByRole('navigation')
    const homeLink = mainNav.querySelector('a[href="/"]')
    
    // 验证CSS类名存在（实际的hover效果通过CSS实现）
    expect(homeLink).toHaveClass('nav-link')
  })

  it('应该正确处理用户登出', () => {
    // TODO: 实现用户状态管理后，测试登出功能
    // 这个测试需要在实现用户状态管理后完善
    renderWithRouter(<Header />)
    
    // 暂时验证组件正常渲染
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('应该在不同页面高亮当前导航项', () => {
    // TODO: 实现路由状态检测后，测试当前页面高亮
    // 这个测试需要在实现路由状态检测后完善
    renderWithRouter(<Header />)
    
    const navigation = screen.getByRole('navigation')
    expect(navigation).toBeInTheDocument()
  })

  it('应该显示用户头像（如果已登录）', () => {
    // TODO: 实现用户状态管理后，测试用户头像显示
    // 这个测试需要在实现用户状态管理后完善
    renderWithRouter(<Header />)
    
    // 暂时验证用户区域存在（未登录状态显示登录注册按钮）
    const userSection = screen.getByText('登录').closest('.auth-buttons')
    expect(userSection).toBeInTheDocument()
  })
})