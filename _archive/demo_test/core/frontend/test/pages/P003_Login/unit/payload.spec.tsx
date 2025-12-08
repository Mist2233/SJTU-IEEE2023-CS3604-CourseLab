import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import type { SpyInstance } from 'vitest'
import * as api from '../../../../src/services/api'
import LoginPage from '../../../../src/pages/P003/LoginPage.jsx'

describe('P003_Login 单元测试 - 登录参数构造', () => {
  it('输入手机号与密码后按预期构造请求体', async () => {
    const loginMock: SpyInstance = vi.spyOn(api as any, 'login')
    loginMock.mockImplementation(async () => ({ success: false, message: '登录失败' } as any))
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    await user.type(screen.getByPlaceholderText('用户名/邮箱/手机号'), '13800138000')
    await user.type(screen.getByPlaceholderText('密码'), 'pass123')
    await user.click(screen.getByRole('button', { name: '立即登录' }))
    expect(loginMock).toHaveBeenCalledTimes(1)
    expect(loginMock).toHaveBeenCalledWith({ identifier: '13800138000', password: 'pass123' })
  })
})
