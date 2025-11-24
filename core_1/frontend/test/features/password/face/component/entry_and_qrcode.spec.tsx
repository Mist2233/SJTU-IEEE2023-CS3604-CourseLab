import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import * as api from '../../../../../src/services/api'
import FacePasswordResetPage from '../../../../../src/pages/P007/FacePasswordResetPage.jsx'

describe('P007 人脸识别找回 - 入口与二维码展示', () => {
  test('渲染入口视图与二维码展示', async () => {
    vi.spyOn(api, 'initFaceAuth').mockResolvedValue({ sessionId: 'S1', qrCode: 'data:image/png;base64,xxx' })
    render(<FacePasswordResetPage />)
    expect(await screen.findByAltText('二维码')).toBeInTheDocument()
    expect(screen.getByText(/状态：/)).toBeInTheDocument()
  })
})
