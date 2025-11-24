import React from 'react'
import { render, screen } from '@testing-library/react'
import PasswordPhoneResetPage from '../../../../../src/pages/P007/PasswordPhoneResetPage.jsx'

describe('P007 手机号码找回 - 新密码输入与一致性', () => {
  test('渲染新密码与确认密码输入', () => {
    render(<PasswordPhoneResetPage />)
    expect(screen.getByPlaceholderText('设置新密码')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('再次输入新密码')).toBeInTheDocument()
  })
})
