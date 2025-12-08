import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import * as api from '../../../../src/services/api'
import SearchResultsPage from '../../../../src/pages/P002/SearchResultsPage.jsx'

const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockedNavigate }
})

const mockData = [{
  trainNumber: 'G99',
  departureStation: '北京南',
  arrivalStation: '上海虹桥',
  departureTime: '08:00',
  arrivalTime: '12:30',
  duration: '4:30',
  seats: { secondClass: { available: 12, price: 553 } }
}]

describe('P002_Search 组件测试 - 预订按钮交互', () => {
  it('点击预订触发导航到/booking并携带state', async () => {
    const user = userEvent.setup()
    const searchMock = vi.spyOn(api, 'searchTrains')
    searchMock.mockResolvedValue(mockData as any)
    render(
      <MemoryRouter initialEntries={[{ pathname: '/search', search: '?from=北京南&to=上海虹桥' }] as any}>
        <SearchResultsPage />
      </MemoryRouter>
    )
    const bookBtn = await screen.findByText('预订')
    await user.click(bookBtn)
    expect(mockedNavigate).toHaveBeenCalled()
    const args = mockedNavigate.mock.calls[0]
    expect(args[0]).toBe('/booking')
    expect(args[1]?.state?.train?.trainNumber).toBe('G99')
    expect(args[1]?.state?.searchConditions).toBeTruthy()
  })
})
