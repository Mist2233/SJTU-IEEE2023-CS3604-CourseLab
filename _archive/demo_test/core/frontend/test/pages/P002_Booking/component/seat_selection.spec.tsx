import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import BookingPage from '../../../../src/pages/P005/BookingPage.jsx'

describe('P002_Booking 组件测试 - 席别选择交互', () => {
  it('切换席别后单价影响总价，余票为0的席别不可选', async () => {
    const user = userEvent.setup()
    const train = { seats: {
      secondClass: { price: 200, available: 0 },
      firstClass: { price: 300, available: 5 },
      businessClass: { price: 500, available: 1 }
    }}
    render(
      <MemoryRouter initialEntries={[{ pathname: '/booking', state: { train, searchConditions: { date: '2025-11-22', from: '北京南', to: '上海虹桥' } } }] as any}>
        <BookingPage />
      </MemoryRouter>
    )
    const selects = screen.getAllByRole('combobox')
    const seatSelect = selects[1]
    expect(screen.getByText('总价：¥200')).toBeInTheDocument()
    await user.selectOptions(seatSelect, 'first')
    expect(screen.getByText('总价：¥300')).toBeInTheDocument()
    const secondOption = screen.getByRole('option', { name: /二等座/ })
    expect(secondOption).toBeDisabled()
  })
})
