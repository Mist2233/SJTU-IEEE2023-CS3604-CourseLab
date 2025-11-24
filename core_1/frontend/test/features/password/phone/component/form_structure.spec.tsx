import React from 'react'
import { render, screen } from '@testing-library/react'
import PasswordPhoneResetPage from '../../../../../src/pages/P007/PasswordPhoneResetPage.jsx'

describe('P007 手机号码找回 - 表单渲染结构', () => {
  test('渲染手机号、身份证号、证件类型、获取验证码按钮', () => {
    const { container } = render(<PasswordPhoneResetPage />)
    expect(screen.getByPlaceholderText('请输入手机号')).toBeInTheDocument()
    expect(container.querySelector('select')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('请输入身份证号')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /获取验证码/ })).toBeInTheDocument()
  })
})
