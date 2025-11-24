import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import * as api from '../../../../../src/services/api'
import PasswordResetFromEmailPage from '../../../../../src/pages/P007/PasswordResetFromEmailPage.jsx'

describe('P007 邮箱找回 - 通过邮件链接进入重置页', () => {
  test('校验token通过后渲染新密码表单', async () => {
    vi.spyOn(api, 'validateEmailResetToken').mockResolvedValue({ valid: true })
    render(<PasswordResetFromEmailPage token={'valid_token'} />)
    expect(await screen.findByText('设置新密码')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('设置新密码')).toBeInTheDocument()
  })
})
