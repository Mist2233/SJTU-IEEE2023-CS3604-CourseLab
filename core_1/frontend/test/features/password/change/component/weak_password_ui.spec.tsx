import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import * as api from '../../../../../src/services/api'
import ChangePasswordPage from '../../../../../src/pages/P007/ChangePasswordPage.jsx'

describe('P007 登录后密码修改 - 弱密码UI', () => {
  test('弱密码时显示错误信息与红色边框样式', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'changePassword').mockRejectedValue(new Error('密码强度不足'))
    render(<ChangePasswordPage />)
    await user.type(screen.getByPlaceholderText('原密码'), 'Correct$1')
    await user.type(screen.getByPlaceholderText('新密码'), 'weak')
    await user.click(screen.getByRole('button', { name: '提交' }))
    const err = await screen.findByText(/密码强度不足/)
    expect(err).toHaveClass('weak')
  })
})
