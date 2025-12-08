import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import * as api from '../../../../src/services/api'
import RegisterPage from '../../../../src/pages/P004/RegisterPage.jsx'

describe('P004_Register 集成测试 - 注册成功跳转', () => {
  it('完整填写并勾选协议后成功注册，弹窗并跳转登录页', async () => {
    const user = userEvent.setup()
    const registerMock = vi.spyOn(api, 'register').mockResolvedValue({} as any)
    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/register' } as any]}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<div>登录页</div>} />
        </Routes>
      </MemoryRouter>
    )
    await user.type(screen.getByPlaceholderText('用户名设置成功后不可修改'), 'user_123')
    const pwd = document.querySelector('input[name="password"]') as HTMLInputElement
    await user.type(pwd, 'Abc123!')
    await user.type(screen.getByPlaceholderText('再次输入您的登录密码'), 'Abc123!')
    await user.type(screen.getByPlaceholderText('请输入姓名'), '张三')
    await user.type(screen.getByPlaceholderText('请输入您的证件号码'), '110101199001011234')
    await user.type(container.querySelector('.phone-input') as HTMLInputElement, '13800138000')
    await user.type(screen.getByPlaceholderText('请输入短信验证码'), '123456')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: '下一步' }))
    expect(registerMock).toHaveBeenCalled()
    expect(await screen.findByText('注册成功')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '去登录' }))
    expect(screen.getByText('登录页')).toBeInTheDocument()
  })
})
