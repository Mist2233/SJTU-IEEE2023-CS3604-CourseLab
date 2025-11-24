import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PasswordPhoneResetPage from '../../../../../src/pages/P007/PasswordPhoneResetPage.jsx'

describe('P007 手机号码找回 - 获取验证码按钮状态', () => {
  test('点击后按钮禁用并显示60秒倒计时', async () => {
    const user = userEvent.setup()
    render(<PasswordPhoneResetPage />)
    const btn = screen.getByRole('button', { name: /获取验证码/ })
    await user.click(btn)
    expect(btn).toBeDisabled()
    expect(btn.textContent).toMatch(/\(60s\)/)
  })
})
