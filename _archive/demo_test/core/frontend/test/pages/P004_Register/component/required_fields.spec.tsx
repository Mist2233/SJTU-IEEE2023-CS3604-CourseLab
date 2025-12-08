import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import RegisterPage from '../../../../src/pages/P004/RegisterPage.jsx'

describe('P004_Register 组件测试 - 必填项拦截', () => {
  it('未勾选协议点击注册弹出提示', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )
    const pwd = document.querySelector('input[name="password"]') as HTMLInputElement
    await user.type(screen.getByPlaceholderText('用户名设置成功后不可修改'), 'user_chk')
    await user.type(pwd, 'Abc123!')
    await user.type(screen.getByPlaceholderText('再次输入您的登录密码'), 'Abc123!')
    await user.type(screen.getByPlaceholderText('请输入姓名'), '王小明')
    await user.type(screen.getByPlaceholderText('请输入您的证件号码'), '110101199001011234')
    await user.type(document.querySelector('.phone-input') as HTMLInputElement, '13800138000')
    await user.type(screen.getByPlaceholderText('请输入短信验证码'), '123456')
    await user.click(screen.getByRole('button', { name: '下一步' }))
    expect(screen.getAllByText('请同意服务条款').length).toBeGreaterThan(0)
  })
})
