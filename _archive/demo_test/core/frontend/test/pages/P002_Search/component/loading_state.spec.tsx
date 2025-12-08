import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import * as api from '../../../../src/services/api'
import SearchResultsPage from '../../../../src/pages/P002/SearchResultsPage.jsx'

// use spy to mock searchTrains with proper typings

describe('P002_Search 组件测试 - 初始加载状态', () => {
  it('挂载初期显示加载中，加载完成后隐藏', async () => {
    const searchMock = vi.spyOn(api, 'searchTrains')
    searchMock.mockResolvedValue([] as any)
    render(
      <MemoryRouter initialEntries={[{ pathname: '/search', search: '?from=北京南&to=上海虹桥' }] as any}>
        <SearchResultsPage />
      </MemoryRouter>
    )
    expect(screen.getByText('正在查询列车信息...')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('正在查询列车信息...')).not.toBeInTheDocument())
  })
})
