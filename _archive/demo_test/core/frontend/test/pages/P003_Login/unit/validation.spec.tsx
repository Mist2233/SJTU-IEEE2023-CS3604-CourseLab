import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../../../../src/pages/P003/LoginPage.jsx'

describe('P003_Login 单元测试 - 表单字段校验逻辑', () => {
  it('手机号与密码为空时标记错误', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    await user.click(screen.getByRole('button', { name: '立即登录' }))
    const phoneRow = container.querySelector('.input-row:nth-of-type(1)')
    const pwdRow = container.querySelector('.input-row:nth-of-type(2)')
    expect(phoneRow?.classList.contains('has-error')).toBe(true)
    expect(pwdRow?.classList.contains('has-error')).toBe(true)
  })

  it('任意标识符均可，非空不标记错误', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    const phoneInput = screen.getByPlaceholderText('用户名/邮箱/手机号')
    const pwdInput = screen.getByPlaceholderText('密码')
    await user.type(phoneInput, '12345')
    await user.type(pwdInput, 'abcdef')
    await user.click(screen.getByRole('button', { name: '立即登录' }))
    const phoneRow = container.querySelector('.input-row:nth-of-type(1)')
    expect(phoneRow?.classList.contains('has-error')).toBe(false)
  })
})
