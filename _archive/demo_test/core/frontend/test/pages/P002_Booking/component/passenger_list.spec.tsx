import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import BookingPage from '../../../../src/pages/P005/BookingPage.jsx'

describe('P002_Booking 组件测试 - 乘客添加与删除', () => {
  it('添加乘客会增加表单行，删除按钮生效', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[{ pathname: '/booking', state: {} }] as any}>
        <BookingPage />
      </MemoryRouter>
    )
    expect(screen.getAllByPlaceholderText('请输入乘客姓名').length).toBe(1)
    await user.click(screen.getByText('添加乘客'))
    expect(screen.getAllByPlaceholderText('请输入乘客姓名').length).toBe(2)
    await user.click(screen.getAllByText('删除')[0])
    expect(screen.getAllByPlaceholderText('请输入乘客姓名').length).toBe(1)
  })
})
