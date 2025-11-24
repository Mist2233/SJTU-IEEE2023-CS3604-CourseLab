import React from 'react'
import { render, screen } from '@testing-library/react'
import FacePasswordResetPage from '../../../../../src/pages/P007/FacePasswordResetPage.jsx'

describe('P007 人脸识别找回 - 重试与切换方式', () => {
  test('渲染"尝试其他方式"按钮', () => {
    render(<FacePasswordResetPage />)
    expect(screen.getByRole('button', { name: '尝试其他方式' })).toBeInTheDocument()
  })
})
