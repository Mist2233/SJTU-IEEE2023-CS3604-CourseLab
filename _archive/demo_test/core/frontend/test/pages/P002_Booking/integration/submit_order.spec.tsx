import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import * as api from '../../../../src/services/api'
import BookingPage from '../../../../src/pages/P005/BookingPage.jsx'

const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockedNavigate }
})

describe('P002_Booking 集成测试 - 提单全流程', () => {
  it('提交成功后跳转到/my-orders', async () => {
    const user = userEvent.setup()
    const createOrderMock = vi.spyOn(api, 'createOrder')
    createOrderMock.mockResolvedValue({ success: true } as any)
    render(
      <MemoryRouter initialEntries={[{ pathname: '/booking', state: {} }] as any}>
        <BookingPage />
      </MemoryRouter>
    )
    await user.type(screen.getByPlaceholderText('请输入乘客姓名'), '王五')
    await user.type(screen.getByPlaceholderText('请输入身份证号'), '110101199001011234')
    await user.click(screen.getByText('提交订单'))
    expect(mockedNavigate).toHaveBeenCalledWith('/my-orders')
  })

  it('提交失败显示错误弹窗', async () => {
    const user = userEvent.setup()
    const createOrderMock = vi.spyOn(api, 'createOrder')
    createOrderMock.mockResolvedValue({ success: false, message: '创建订单失败' } as any)
    render(
      <MemoryRouter initialEntries={[{ pathname: '/booking', state: {} }] as any}>
        <BookingPage />
      </MemoryRouter>
    )
    await user.type(screen.getByPlaceholderText('请输入乘客姓名'), '王五')
    await user.type(screen.getByPlaceholderText('请输入身份证号'), '110101199001011234')
    await user.click(screen.getByText('提交订单'))
    expect(await screen.findByText('创建订单失败')).toBeInTheDocument()
  })
})
