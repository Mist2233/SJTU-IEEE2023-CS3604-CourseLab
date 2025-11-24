import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import * as api from '../../../../../src/services/api'
import ChangePasswordPage from '../../../../../src/pages/P007/ChangePasswordPage.jsx'

describe('P007 登录后密码修改 - 成功反馈', () => {
  test('成功修改后显示提示', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'changePassword').mockResolvedValue({})
    render(<ChangePasswordPage />)
    await user.type(screen.getByPlaceholderText('原密码'), 'Correct$1')
    await user.type(screen.getByPlaceholderText('新密码'), 'Aa1!aaaa')
    await user.click(screen.getByRole('button', { name: '提交' }))
    expect(await screen.findByText('密码修改成功')).toBeInTheDocument()
  })
})
