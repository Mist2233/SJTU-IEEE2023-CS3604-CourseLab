import React from 'react'
import { render, screen } from '@testing-library/react'
import PasswordEmailResetPage from '../../../../../src/pages/P007/PasswordEmailResetPage.jsx'

describe('P007 邮箱找回 - 表单渲染', () => {
  test('渲染邮箱、身份证、证件类型输入与提交按钮', () => {
    const { container } = render(<PasswordEmailResetPage />)
    expect(screen.getByPlaceholderText('请输入邮箱')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('请输入身份证号')).toBeInTheDocument()
    expect(container.querySelector('select')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '申请重置链接' })).toBeInTheDocument()
  })
})
