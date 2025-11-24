import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import * as api from '../../../../../src/services/api'
import PasswordEmailResetPage from '../../../../../src/pages/P007/PasswordEmailResetPage.jsx'

describe('P007 邮箱找回 - 申请后提示', () => {
  test('提交后提示"重置链接已发送至您的邮箱"', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'requestEmailResetLink').mockResolvedValue({})
    render(<PasswordEmailResetPage />)
    await user.type(screen.getByPlaceholderText('请输入邮箱'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: '申请重置链接' }))
    expect(await screen.findByText('重置链接已发送至您的邮箱')).toBeInTheDocument()
  })
})
