import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import * as api from '../../../../src/services/api'
import LoginPage from '../../../../src/pages/P003/LoginPage.jsx'

describe('P003_Login 组件测试 - 加载状态反馈', () => {
  it('提交期间按钮文案为“登录中...”且disabled', async () => {
    const user = userEvent.setup()
    const loginMock = vi.spyOn(api, 'login')
    loginMock.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: false } as any), 50)))
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    await user.type(screen.getByPlaceholderText('用户名/邮箱/手机号'), '13800138000')
    await user.type(screen.getByPlaceholderText('密码'), 'abc12345')
    await user.click(screen.getByRole('button', { name: '立即登录' }))
    const btn = screen.getByRole('button', { name: '登录中...' }) as HTMLButtonElement
    expect(btn).toBeDisabled()
    expect(btn).toHaveTextContent('登录中...')
  })
})
