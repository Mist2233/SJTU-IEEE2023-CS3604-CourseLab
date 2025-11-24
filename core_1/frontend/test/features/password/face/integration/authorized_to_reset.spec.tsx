import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import * as api from '../../../../../src/services/api'
import FacePasswordResetPage from '../../../../../src/pages/P007/FacePasswordResetPage.jsx'

describe('P007 人脸识别找回 - 授权后设置新密码', () => {
  test('授权状态后点击设置新密码成功', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'initFaceAuth').mockResolvedValue({ sessionId: 'S1', qrCode: 'data:image/png;base64,xxx' })
    vi.spyOn(api, 'getFaceAuthStatus').mockResolvedValue({ status: 'authorized', attempts: 0 })
    const confirmMock = vi.spyOn(api, 'confirmFaceAuth').mockResolvedValue({})
    render(<FacePasswordResetPage />)
    expect(await screen.findByAltText('二维码')).toBeInTheDocument()
    const btn = await screen.findByRole('button', { name: '设置新密码' })
    await user.click(btn)
    expect(confirmMock).toHaveBeenCalled()
  })
})
