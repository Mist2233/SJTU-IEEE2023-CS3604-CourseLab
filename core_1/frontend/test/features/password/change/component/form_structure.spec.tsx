import React from 'react'
import { render, screen } from '@testing-library/react'
import ChangePasswordPage from '../../../../../src/pages/P007/ChangePasswordPage.jsx'

describe('P007 登录后密码修改 - 表单结构', () => {
  test('渲染原密码、新密码、确认新密码、强度指示器', () => {
    const { container } = render(<ChangePasswordPage />)
    expect(screen.getByPlaceholderText('原密码')).toBeInTheDocument()
    expect(container.querySelector('input[name="password"]')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('确认新密码')).toBeInTheDocument()
    expect(container.querySelector('.strength')).toBeInTheDocument()
  })
})
