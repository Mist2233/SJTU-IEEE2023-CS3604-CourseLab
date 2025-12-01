import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import BookingPage from '../../../../src/pages/P005/BookingPage.jsx'

describe('P002_Booking 单元测试 - 票价计算', () => {
  it('总价等于各乘客所选席别价格之和', async () => {
    const user = userEvent.setup()
    const train = { seats: {
      secondClass: { price: 200, available: 10 },
      firstClass: { price: 300, available: 10 },
      businessClass: { price: 500, available: 10 }
    }}
    render(
      <MemoryRouter initialEntries={[{ pathname: '/booking', state: { train, searchConditions: { date: '2025-11-22', from: '北京南', to: '上海虹桥' } } }] as any}>
        <BookingPage />
      </MemoryRouter>
    )
    expect(screen.getByText('总价：¥200')).toBeInTheDocument()
    await user.click(screen.getByText('添加乘客'))
    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[1], 'first')
    expect(screen.getByText('总价：¥500')).toBeInTheDocument()
  })
})
