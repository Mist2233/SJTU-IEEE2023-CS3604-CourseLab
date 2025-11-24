import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import * as api from '../../../../../src/services/api'
import PasswordResetFromEmailPage from '../../../../../src/pages/P007/PasswordResetFromEmailPage.jsx'

describe('P007 邮箱找回 - 过期提示页与重新申请入口', () => {
  test('过期时展示提示与重新申请入口', async () => {
    vi.spyOn(api, 'validateEmailResetToken').mockRejectedValue(new Error('链接已过期'))
    render(<PasswordResetFromEmailPage token={'expired_token'} />)
    expect(await screen.findByText('链接过期')).toBeInTheDocument()
    expect(screen.getByText('重新申请')).toBeInTheDocument()
  })
})
