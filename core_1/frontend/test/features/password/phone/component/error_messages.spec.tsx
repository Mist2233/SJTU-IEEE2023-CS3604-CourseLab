import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import * as api from '../../../../../src/services/api'
import PasswordPhoneResetPage from '../../../../../src/pages/P007/PasswordPhoneResetPage.jsx'

describe('P007 手机号码找回 - 错误提示UI', () => {
  test('网络异常时显示错误信息', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'requestPasswordResetByPhone').mockRejectedValue(new Error('网络异常'))
    render(<PasswordPhoneResetPage />)
    await user.type(screen.getByPlaceholderText('请输入手机号'), '13800138000')
    await user.type(screen.getByPlaceholderText('请输入短信验证码'), '123456')
    await user.type(screen.getByPlaceholderText('设置新密码'), 'Aa1!aaaa')
    await user.click(screen.getByRole('button', { name: '提交' }))
    expect(await screen.findByText(/网络异常/)).toBeInTheDocument()
  })
})
