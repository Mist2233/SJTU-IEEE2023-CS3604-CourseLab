import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SearchResultsPage from '../../../../src/pages/P002/SearchResultsPage.jsx'

describe('P002_Search 单元测试 - URL参数解析', () => {
  it('优先从URL Query解析搜索条件', () => {
    render(
      <MemoryRouter initialEntries={['/search?from=Beijing&to=Shanghai&date=2025-11-22']}>
        <SearchResultsPage />
      </MemoryRouter>
    )
    expect(screen.getByDisplayValue('Beijing')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Shanghai')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2025-11-22')).toBeInTheDocument()
    expect(screen.getByText(/Beijing → Shanghai（2025-11-22\s*周六）/)).toBeInTheDocument()
  })

  it('无Query时使用默认或state回落', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/search', state: { from: '深圳', to: '广州', date: '2025-11-21' } }] as any}>
        <SearchResultsPage />
      </MemoryRouter>
    )
    expect(screen.getByDisplayValue('深圳')).toBeInTheDocument()
    expect(screen.getByDisplayValue('广州')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2025-11-21')).toBeInTheDocument()
  })
})