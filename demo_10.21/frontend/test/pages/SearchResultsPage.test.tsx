import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SearchResultsPage from '../../src/pages/SearchResultsPage'
import { searchTrains } from '../../src/services/api'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock API calls
vi.mock('../../src/services/api', () => ({
  searchTrains: vi.fn() as any,
}))

const mockSearchParams = {
  from: '北京',
  to: '上海',
  date: '2024-01-15',
  trainType: 'G'
}

const renderWithRouter = (component: React.ReactElement, initialState = mockSearchParams) => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/search-results', state: initialState }]}>
      {component}
    </MemoryRouter>
  )
}

describe('SearchResultsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该显示搜索参数', async () => {
    (vi.mocked(searchTrains) as any).mockResolvedValue([])
    
    renderWithRouter(<SearchResultsPage />)
    
    // 等待加载完成
    await waitFor(() => {
      expect(screen.queryByText('正在搜索列车信息...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText(/北京/)).toBeInTheDocument()
    expect(screen.getByText(/上海/)).toBeInTheDocument()
    expect(screen.getByText(/2024-01-15/)).toBeInTheDocument()
  })

  it('应该显示加载状态', () => {
    vi.mocked(searchTrains).mockImplementation(() => new Promise(() => {}) as any) // 永不resolve

    renderWithRouter(<SearchResultsPage />)
    
    expect(screen.getByText(/正在搜索列车信息.../)).toBeInTheDocument()
  })

  it('应该显示搜索结果', async () => {
    const mockTrains = [
      {
        trainNumber: 'G1',
        departureTime: '08:00',
        arrivalTime: '13:00',
        duration: '5小时',
        departureStation: '北京南',
        arrivalStation: '上海虹桥',
        seats: {
          businessClass: { available: 10, price: 1748 },
          firstClass: { available: 20, price: 933 },
          secondClass: { available: 50, price: 553 }
        }
      },
      {
        trainNumber: 'G3',
        departureTime: '09:00',
        arrivalTime: '14:30',
        duration: '5小时30分',
        departureStation: '北京南',
        arrivalStation: '上海虹桥',
        seats: {
          businessClass: { available: 5, price: 1748 },
          firstClass: { available: 15, price: 933 },
          secondClass: { available: 30, price: 553 }
        }
      }
    ];
    (vi.mocked(searchTrains) as any).mockResolvedValue(mockTrains)

    renderWithRouter(<SearchResultsPage />)
    
    // 首先等待加载状态消失
    await waitFor(() => {
      expect(screen.queryByText('正在搜索列车信息...')).not.toBeInTheDocument()
    })
    
    // 然后验证搜索结果
    await waitFor(() => {
      expect(screen.getByText('G1')).toBeInTheDocument()
    })
    
    expect(screen.getByText('G3')).toBeInTheDocument()
    expect(screen.getByText('08:00')).toBeInTheDocument()
    expect(screen.getByText('13:00')).toBeInTheDocument()
    expect(screen.getByText('5小时')).toBeInTheDocument()
    expect(screen.getAllByText('北京南')).toHaveLength(2)
    expect(screen.getAllByText('上海虹桥')).toHaveLength(2)
  })

  it('应该显示座位类型和价格', async () => {
    const mockTrains = [
      {
        trainNumber: 'G1',
        departureTime: '08:00',
        arrivalTime: '13:00',
        duration: '5小时',
        departureStation: '北京南',
        arrivalStation: '上海虹桥',
        seats: {
          businessClass: { available: 10, price: 1748 },
          firstClass: { available: 20, price: 933 },
          secondClass: { available: 50, price: 553 }
        }
      }
    ];
    (vi.mocked(searchTrains) as any).mockResolvedValue(mockTrains)

    renderWithRouter(<SearchResultsPage />)
    
    // 等待加载完成
    await waitFor(() => {
      expect(screen.queryByText('正在搜索列车信息...')).not.toBeInTheDocument()
    })
    
    // 验证座位类型和价格
    await waitFor(() => {
      expect(screen.getByText('商务座')).toBeInTheDocument()
    })
    
    expect(screen.getByText('一等座')).toBeInTheDocument()
    expect(screen.getByText('二等座')).toBeInTheDocument()
    expect(screen.getByText('¥1748')).toBeInTheDocument()
    expect(screen.getByText('¥933')).toBeInTheDocument()
    expect(screen.getByText('¥553')).toBeInTheDocument()
  })

  it('应该显示余票数量', async () => {
    const mockTrains = [
      {
        trainNumber: 'G1',
        departureTime: '08:00',
        arrivalTime: '13:00',
        duration: '5小时',
        departureStation: '北京南',
        arrivalStation: '上海虹桥',
        seats: {
          businessClass: { available: 10, price: 1748 },
          firstClass: { available: 20, price: 933 },
          secondClass: { available: 50, price: 553 }
        }
      }
    ];
    (vi.mocked(searchTrains) as any).mockResolvedValue(mockTrains)

    renderWithRouter(<SearchResultsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/余10张/)).toBeInTheDocument()
      expect(screen.getByText(/余20张/)).toBeInTheDocument()
      expect(screen.getByText(/余50张/)).toBeInTheDocument()
    })
  })

  it('应该显示无票状态', async () => {
    const mockTrains = [
      {
        trainNumber: 'G1',
        departureTime: '08:00',
        arrivalTime: '13:00',
        duration: '5小时',
        departureStation: '北京南',
        arrivalStation: '上海虹桥',
        seats: {
          businessClass: { available: 0, price: 1748 },
          firstClass: { available: 0, price: 933 },
          secondClass: { available: 5, price: 553 }
        }
      }
    ];
    (vi.mocked(searchTrains) as any).mockResolvedValue(mockTrains)

    renderWithRouter(<SearchResultsPage />)
    
    await waitFor(() => {
      expect(screen.getAllByText(/无票/).length).toBeGreaterThan(0)
      expect(screen.getByText(/余5张/)).toBeInTheDocument()
    })
  })

  it('应该支持预订车票', async () => {
    const mockTrains = [
      {
        trainNumber: 'G1',
        departureTime: '08:00',
        arrivalTime: '13:00',
        duration: '5小时',
        departureStation: '北京南',
        arrivalStation: '上海虹桥',
        seats: {
          businessClass: { available: 10, price: 1748 },
          firstClass: { available: 20, price: 933 },
          secondClass: { available: 50, price: 553 }
        }
      }
    ];
    (vi.mocked(searchTrains) as any).mockResolvedValue(mockTrains)

    renderWithRouter(<SearchResultsPage />)
    
    await waitFor(() => {
      const bookButtons = screen.getAllByText('预订')
      expect(bookButtons.length).toBeGreaterThan(0)
      
      fireEvent.click(bookButtons[0])
      
      expect(mockNavigate).toHaveBeenCalledWith('/booking', {
        state: expect.objectContaining({
          train: expect.objectContaining({
            trainNumber: 'G1'
          })
        })
      })
    })
  })

  it('应该处理搜索无结果', async () => {
    (vi.mocked(searchTrains) as any).mockResolvedValue([])

    renderWithRouter(<SearchResultsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/未找到符合条件的列车/)).toBeInTheDocument()
      expect(screen.getByText(/请尝试修改搜索条件/)).toBeInTheDocument()
    })
  })

  it('应该处理搜索错误', async () => {
    vi.mocked(searchTrains).mockRejectedValue(new Error('网络错误'))

    renderWithRouter(<SearchResultsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/搜索失败/)).toBeInTheDocument()
      expect(screen.getByText(/网络错误/)).toBeInTheDocument()
    })
  })

  it('应该支持重新搜索', async () => {
    vi.mocked(searchTrains).mockRejectedValue(new Error('网络错误'))

    renderWithRouter(<SearchResultsPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/搜索失败/)).toBeInTheDocument()
    })
    
    const retryButton = screen.getByText('重新搜索')
    fireEvent.click(retryButton)
    
    expect(vi.mocked(searchTrains)).toHaveBeenCalledTimes(2)
  })

  it('应该支持刷新搜索结果', async () => {
    const mockRefreshTrains = [
      {
        trainNumber: 'G1',
        departureTime: '08:00',
        arrivalTime: '13:00',
        duration: '5小时',
        departureStation: '北京南',
        arrivalStation: '上海虹桥',
        seats: {
          secondClass: { available: 50, price: 553 }
        }
      }
    ];
    (vi.mocked(searchTrains) as any).mockResolvedValue(mockRefreshTrains)

    renderWithRouter(<SearchResultsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('G1')).toBeInTheDocument()
    })
    
    const refreshButton = screen.getByText('刷新')
    fireEvent.click(refreshButton)
    
    expect(vi.mocked(searchTrains)).toHaveBeenCalledTimes(2)
  })
})