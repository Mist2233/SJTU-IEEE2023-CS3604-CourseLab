import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Header from '../../../../src/components/Header.jsx'

describe('Header 集成测试 - 路由联动测试', () => {
  it('点击登录跳转至 /login；点击会员服务不发生跳转', async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[{ pathname: '/' } as any]}>
        <Routes>
          <Route path="/" element={<Header />} />
          <Route path="/login" element={<div>登录页</div>} />
        </Routes>
      </MemoryRouter>
    )
    await user.click(screen.getByText('登录'))
    expect(screen.getByText('登录页')).toBeInTheDocument()
    // 返回到包含Header的路由，以验证会员服务不跳转
    render(
      <MemoryRouter initialEntries={[{ pathname: '/' } as any]}>
        <Routes>
          <Route path="/" element={<Header />} />
          <Route path="/members" element={<div>会员服务页</div>} />
        </Routes>
      </MemoryRouter>
    )
    await user.click(screen.getByText('会员服务'))
    expect(screen.queryByText('会员服务页')).toBeNull()
  })
})
