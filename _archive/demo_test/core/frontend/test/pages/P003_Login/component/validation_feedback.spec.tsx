import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../../../../src/pages/P003/LoginPage.jsx'

describe('P003_Login 组件测试 - 表单验证反馈', () => {
  it('未填手机号与密码时标记错误样式', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    await user.click(screen.getByRole('button', { name: '立即登录' }))
    const rows = container.querySelectorAll('.input-row')
    expect(rows[0].classList.contains('has-error')).toBe(true)
    expect(rows[1].classList.contains('has-error')).toBe(true)
  })

  it('任意标识符均可，非空不标记错误样式', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    await user.type(screen.getByPlaceholderText('用户名/邮箱/手机号'), '12345')
    await user.type(screen.getByPlaceholderText('密码'), 'abc12345')
    await user.click(screen.getByRole('button', { name: '立即登录' }))
    const rows = container.querySelectorAll('.input-row')
    expect(rows[0].classList.contains('has-error')).toBe(false)
  })
})
