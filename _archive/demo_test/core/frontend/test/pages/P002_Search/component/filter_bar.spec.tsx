import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import * as api from '../../../../src/services/api'
import SearchResultsPage from '../../../../src/pages/P002/SearchResultsPage.jsx'

let searchMock: any
beforeEach(() => {
  searchMock = vi.spyOn(api, 'searchTrains')
  searchMock.mockClear()
  searchMock.mockResolvedValue([] as any)
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe('P002_Search 组件测试 - 筛选栏交互（按现有实现）', () => {
  it('点击交换按钮后出发地与目的地交换', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/search?from=Beijing&to=Shanghai&date=2025-11-22']}>
        <SearchResultsPage />
      </MemoryRouter>
    )
    const fromInput = screen.getByDisplayValue('Beijing') as HTMLInputElement
    const toInput = screen.getByDisplayValue('Shanghai') as HTMLInputElement
    expect(fromInput.value).toBe('Beijing')
    expect(toInput.value).toBe('Shanghai')
    await user.click(screen.getByRole('button', { name: '⇌' }))
    expect(fromInput.value).toBe('Shanghai')
    expect(toInput.value).toBe('Beijing')
  })

  it('点击日期导航后更改日期并触发查询', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/search?from=Beijing&to=Shanghai&date=2025-11-22']}>
        <SearchResultsPage />
      </MemoryRouter>
    )
    const dateItems = screen.getAllByRole('button', { hidden: true })
    const secondDate = screen.getAllByText(/\d{1,2}-\d{1,2}/)[1]
    await user.click(secondDate)
    expect(searchMock).toHaveBeenCalledTimes(2)
  })

  it('点击查询按钮触发API调用', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[{ pathname: '/search' }] as any}>
        <SearchResultsPage />
      </MemoryRouter>
    )
    const [fromInput, toInput] = screen.getAllByPlaceholderText('输入或选择站点')
    await user.type(fromInput, '北京南')
    await user.type(toInput, '上海虹桥')
    await user.click(screen.getByText('查询'))
    expect(searchMock).toHaveBeenCalled()
  })
})
