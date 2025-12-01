import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import * as api from '../../../../src/services/api'
import SearchResultsPage from '../../../../src/pages/P002/SearchResultsPage.jsx'

describe('P002_Search 集成测试 - 搜索联动与错误处理', () => {
  it('页面加载自动调用API并渲染结果', async () => {
    const searchMock = vi.spyOn(api, 'searchTrains')
    searchMock.mockResolvedValue([{ trainNumber: 'G1' }] as any)
    render(
      <MemoryRouter initialEntries={[{ pathname: '/search', search: '?from=北京南&to=上海虹桥' }] as any}>
        <SearchResultsPage />
      </MemoryRouter>
    )
    await waitFor(() => expect(searchMock).toHaveBeenCalled())
    const headerInfo = await screen.findByText((content, element) => {
      if (!element) return false
      const isHeader = element.classList.contains('table-header-info')
      const text = element.textContent || ''
      return isHeader && /共计\s*1\s*个车次/.test(text)
    })
    expect(headerInfo).toBeInTheDocument()
  })

  it('API返回错误时显示错误提示', async () => {
    const searchMock = vi.spyOn(api, 'searchTrains')
    searchMock.mockRejectedValue(new Error('500'))
    render(
      <MemoryRouter initialEntries={[{ pathname: '/search', search: '?from=北京南&to=上海虹桥' }] as any}>
        <SearchResultsPage />
      </MemoryRouter>
    )
    expect(await screen.findByText('查询失败，请稍后重试')).toBeInTheDocument()
  })
})
