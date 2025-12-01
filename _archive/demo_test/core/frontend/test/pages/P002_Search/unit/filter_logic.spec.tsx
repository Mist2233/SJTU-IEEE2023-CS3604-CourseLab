import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import SearchResultsPage from '../../../../src/pages/P002/SearchResultsPage.jsx'

vi.mock('../../../../src/services/api', () => ({
  searchTrains: vi.fn(async () => ([{
    trainNumber: 'G100',
    departureStation: '北京南',
    arrivalStation: '上海虹桥',
    departureTime: '08:00',
    arrivalTime: '12:30',
    duration: '4:30',
    seats: {
      businessClass: { available: 25, price: 1700 },
      firstClass: { available: 0, price: 900 },
      secondClass: { available: 5, price: 550 },
      softSleeper: { available: 0, price: 600 },
      hardSleeper: { available: 0, price: 400 },
      hardSeat: { available: 0, price: 200 },
      noSeat: { available: 1, price: 100 },
    }
  }]))
}))

describe('P002_Search 单元测试 - 余票渲染逻辑', () => {
  it('余票为0显示“无”，>=20显示“有”，否则显示数字', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/search', search: '?from=北京南&to=上海虹桥' }] as any}>
        <SearchResultsPage />
      </MemoryRouter>
    )
    const row = await screen.findByRole('row', { name: /G100/ })
    expect(within(row).getByText('25')).toBeInTheDocument()
    expect(within(row).getAllByText('无').length).toBeGreaterThan(0)
    expect(within(row).getByText('5')).toBeInTheDocument()
  })
})
