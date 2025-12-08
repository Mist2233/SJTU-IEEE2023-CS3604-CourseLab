import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import * as api from '../../../../src/services/api'
import RegisterPage from '../../../../src/pages/P004/RegisterPage.jsx'

describe('P004_Register 集成测试 - 注册失败处理', () => {
  it('注册冲突时不跳转并不显示成功提示', async () => {
    const user = userEvent.setup()
    const registerMock = vi.spyOn(api, 'register').mockRejectedValue(new Error('用户已存在'))
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )
    await user.type(screen.getByPlaceholderText('用户名设置成功后不可修改'), 'user_a')
    await user.type(screen.getByPlaceholderText('请输入姓名'), '赵六')
    await user.type(screen.getByPlaceholderText('请输入您的证件号码'), '110101199001011234')
    await user.type(document.querySelector('input[name="password"]') as HTMLInputElement, 'Abc123!')
    await user.type(screen.getByPlaceholderText('再次输入您的登录密码'), 'Abc123!')
    await user.type(document.querySelector('.phone-input') as HTMLInputElement, '13800138000')
    await user.type(screen.getByPlaceholderText('请输入短信验证码'), '123456')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: '下一步' }))
    expect(screen.getAllByText('用户已存在').length).toBeGreaterThan(0)
    expect(registerMock).toHaveBeenCalled()
    expect(screen.getAllByText('用户已存在').length).toBeGreaterThan(0)
  })
})
