import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import BookingPage from '../../../../src/pages/P005/BookingPage.jsx'

describe('P002_Booking 单元测试 - 乘客信息校验', () => {
  it('姓名、证件号必填且证件号需18位格式', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[{ pathname: '/booking', state: {} }] as any}>
        <BookingPage />
      </MemoryRouter>
    )
    await user.click(screen.getByText('提交订单'))
    expect(screen.getByText('请完整填写乘客信息')).toBeInTheDocument()
    await user.type(screen.getByPlaceholderText('请输入乘客姓名'), '张三')
    await user.type(screen.getByPlaceholderText('请输入身份证号'), '12345678901234567')
    await user.click(screen.getByText('提交订单'))
    expect(screen.getByText('身份证号格式不正确')).toBeInTheDocument()
  })
})
