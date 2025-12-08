import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PaymentSuccessPage from '../../../../src/pages/P005/PaymentSuccessPage.jsx'

describe('P005_Success 组件测试 - 导航链接验证', () => {
  it('点击“查看订单”跳转到我的订单', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[{ pathname: '/payment-success/ORDERY' } as any]}>
        <Routes>
          <Route path="/payment-success/:orderId" element={<PaymentSuccessPage />} />
          <Route path="/my" element={<div>我的订单</div>} />
        </Routes>
      </MemoryRouter>
    )
    await user.click(screen.getByRole('button', { name: '查看订单' }))
    expect(screen.getByText('我的订单')).toBeInTheDocument()
  })
})
