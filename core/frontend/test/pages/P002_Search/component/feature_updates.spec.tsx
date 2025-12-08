import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import * as api from '../../../../src/services/api'
import SearchResultsPage from '../../../../src/pages/P002/SearchResultsPage.jsx'

// Mock navigate to avoid errors
const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockedNavigate }
})

describe('P002_Search 新增功能测试 (Issue #17)', () => {
  
  // Helper to setup component with specific mock data
  const setup = (mockData) => {
    const searchMock = vi.spyOn(api, 'searchTrains')
    searchMock.mockResolvedValue(mockData)
    render(
      <MemoryRouter initialEntries={['/search?from=北京&to=上海&date=2023-12-15']}>
        <SearchResultsPage />
      </MemoryRouter>
    )
    return searchMock
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('1. 席别余票状态 UI 优化', () => {
    it('余票为 0 时显示橙色的“候补”', async () => {
      const mockData = [{
        trainNumber: 'G01',
        departureStation: '北京',
        arrivalStation: '上海',
        seats: { secondClass: { available: 0, price: 500 } }
      }]
      setup(mockData)
      
      const cells = await screen.findAllByText('候补')
      expect(cells.length).toBeGreaterThan(0)
      cells.forEach(cell => {
        // 候补 class cell-wait (orange color handled in CSS, but we can check class or color if inline styles are used, 
        // but here we used class in code: <td className="cell-wait">候补</td>. 
        // CSS is not loaded in jsdom usually unless set up, but we can check className)
        expect(cell).toHaveClass('cell-wait')
      })
    })

    it('余票 <= 20 时显示黑色加粗数字', async () => {
      const mockData = [{
        trainNumber: 'G02',
        departureStation: '北京',
        arrivalStation: '上海',
        seats: { secondClass: { available: 5, price: 500 } }
      }]
      setup(mockData)
      
      const cell = await screen.findByText('5')
      expect(cell).toBeInTheDocument()
      expect(cell).toHaveClass('cell-number')
      // User asked for black bold, not red.
      expect(cell).not.toHaveStyle({ color: '#ff4d4f' }) 
    })

    it('余票 > 20 时显示绿色的“有”', async () => {
      const mockData = [{
        trainNumber: 'G03',
        departureStation: '北京',
        arrivalStation: '上海',
        seats: { secondClass: { available: 25, price: 500 } }
      }]
      setup(mockData)
      
      const cell = await screen.findByText('有')
      expect(cell).toBeInTheDocument()
      expect(cell).toHaveClass('cell-available')
    })

    it('余票在 10-20 之间时显示黑色加粗数字', async () => {
      const mockData = [{
        trainNumber: 'G04',
        departureStation: '北京',
        arrivalStation: '上海',
        seats: { secondClass: { available: 15, price: 500 } }
      }]
      setup(mockData)
      
      const cell = await screen.findByText('15')
      expect(cell).toBeInTheDocument()
      expect(cell).toHaveClass('cell-number')
    })
  })

  describe('2. 日期信息回显增强', () => {
    it('界面应显示当前搜索日期的星期几', async () => {
      const mockData = []
      setup(mockData)
      
      // 2023-12-15 is a Friday (周五)
      // Note: The component calculates weekday based on the date.
      // We need to wait for the header info to appear.
      
      // The text is likely split or part of a larger string: "北京 → 上海（2023-12-15 周五）"
      const headerInfo = await screen.findByText((content, element) => {
        return element.classList.contains('table-header-info') && 
               content.includes('2023-12-15') && 
               content.includes('周五')
      })
      expect(headerInfo).toBeInTheDocument()
    })
  })

  describe('3. 预订交互逻辑完善', () => {
    it('当所有席别均为“无”时，禁用预订按钮', async () => {
      const mockData = [{
        trainNumber: 'G05',
        departureStation: '北京',
        arrivalStation: '上海',
        seats: { 
          businessClass: 0, 
          firstClass: 0, 
          secondClass: 0 
        }
      }]
      setup(mockData)
      
      const btn = await screen.findByText('预订')
      expect(btn).toBeDisabled()
      expect(btn).toHaveStyle({ backgroundColor: '#ccc', cursor: 'not-allowed' })
    })

    it('当至少有一个席别有票时，启用预订按钮', async () => {
      const mockData = [{
        trainNumber: 'G06',
        departureStation: '北京',
        arrivalStation: '上海',
        seats: { 
          businessClass: 0, 
          firstClass: 0, 
          secondClass: 5 
        }
      }]
      setup(mockData)
      
      const btn = await screen.findByText('预订')
      expect(btn).not.toBeDisabled()
      expect(btn).not.toHaveStyle({ backgroundColor: '#ccc' })
    })
  })
})
