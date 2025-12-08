import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BookingPage from '../../../../src/pages/P005/BookingPage.jsx'

describe('P002_Booking 组件测试 - 订单信息回显', () => {
  it('显示上一页传递的车次与搜索信息', () => {
    const train = { trainNumber: 'G99', departureTime: '08:00', arrivalTime: '12:30' }
    const searchConditions = { date: '2025-11-22', from: '北京南站', to: '上海虹桥' }
    render(
      <MemoryRouter initialEntries={[{ pathname: '/booking', state: { train, searchConditions } }] as any}>
        <BookingPage />
      </MemoryRouter>
    )
    expect(screen.getByText('2025-11-22')).toBeInTheDocument()
    expect(screen.getByText(/G99次/)).toBeInTheDocument()
    expect(screen.getByText(/北京南站（08:00开）→ 上海虹桥（12:30到）/)).toBeInTheDocument()
  })
})
