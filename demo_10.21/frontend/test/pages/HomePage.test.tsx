import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HomePage from '../../src/pages/HomePage'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('HomePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染火车票查询表单', () => {
    renderWithRouter(<HomePage />)
    
    expect(screen.getByText('火车票查询')).toBeInTheDocument()
    expect(screen.getByLabelText('出发地')).toBeInTheDocument()
    expect(screen.getByLabelText('目的地')).toBeInTheDocument()
    expect(screen.getByLabelText('出发日期')).toBeInTheDocument()
    expect(screen.getByLabelText('车次类型')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '查询' })).toBeInTheDocument()
  })

  it('应该允许用户输入出发地和目的地', () => {
    renderWithRouter(<HomePage />)
    
    const originInput = screen.getByLabelText('出发地') as HTMLInputElement
    const destinationInput = screen.getByLabelText('目的地') as HTMLInputElement
    
    fireEvent.change(originInput, { target: { value: '北京' } })
    fireEvent.change(destinationInput, { target: { value: '上海' } })
    
    expect(originInput.value).toBe('北京')
    expect(destinationInput.value).toBe('上海')
  })

  it('应该允许用户选择出发日期', () => {
    renderWithRouter(<HomePage />)
    
    const dateInput = screen.getByLabelText('出发日期') as HTMLInputElement
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    
    fireEvent.change(dateInput, { target: { value: tomorrowStr } })
    
    expect(dateInput.value).toBe(tomorrowStr)
  })

  it('应该允许用户选择车次类型', () => {
    renderWithRouter(<HomePage />)
    
    const trainTypeSelect = screen.getByLabelText('车次类型') as HTMLSelectElement
    
    fireEvent.change(trainTypeSelect, { target: { value: 'G' } })
    
    expect(trainTypeSelect.value).toBe('G')
  })

  it('应该验证必填字段', async () => {
    renderWithRouter(<HomePage />)
    
    const form = screen.getByRole('form')
    
    // 不填写任何信息直接提交表单
    fireEvent.submit(form)
    
    // 应该显示验证错误信息
    await waitFor(() => {
      expect(screen.getByText(/请填写出发地/)).toBeInTheDocument()
    })
  })

  it('应该验证出发日期不能是过去的日期', async () => {
    renderWithRouter(<HomePage />)
    
    const dateInput = screen.getByLabelText('出发日期')
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    fireEvent.change(dateInput, { target: { value: yesterdayStr } })
    
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText(/出发日期不能是过去的日期/)).toBeInTheDocument()
    })
  })

  it('应该在表单验证通过后导航到搜索结果页面', async () => {
    renderWithRouter(<HomePage />)
    
    // 填写完整的表单信息
    fireEvent.change(screen.getByLabelText('出发地'), { target: { value: '北京' } })
    fireEvent.change(screen.getByLabelText('目的地'), { target: { value: '上海' } })
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    fireEvent.change(screen.getByLabelText('出发日期'), { target: { value: tomorrowStr } })
    
    fireEvent.change(screen.getByLabelText('车次类型'), { target: { value: 'G' } })
    
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/search-results', {
        state: {
          from: '北京',
          to: '上海',
          date: tomorrowStr,
          trainType: 'G'
        }
      })
    })
  })

  it('应该支持出发地和目的地互换', () => {
    renderWithRouter(<HomePage />)
    
    const originInput = screen.getByLabelText('出发地') as HTMLInputElement
    const destinationInput = screen.getByLabelText('目的地') as HTMLInputElement
    
    // 填写出发地和目的地
    fireEvent.change(originInput, { target: { value: '北京' } })
    fireEvent.change(destinationInput, { target: { value: '上海' } })
    
    // 查找并点击互换按钮
    const swapButton = screen.getByRole('button', { name: /互换|交换/ })
    fireEvent.click(swapButton)
    
    // 验证出发地和目的地已互换
    expect(originInput.value).toBe('上海')
    expect(destinationInput.value).toBe('北京')
  })

  it('应该显示热门路线推荐', () => {
    renderWithRouter(<HomePage />)
    
    expect(screen.getByText(/热门路线/)).toBeInTheDocument()
    
    // 验证至少显示几个热门路线
    expect(screen.getByText(/北京 → 上海/)).toBeInTheDocument()
    expect(screen.getByText(/广州 → 深圳/)).toBeInTheDocument()
  })

  it('应该支持点击热门路线快速填充表单', () => {
    renderWithRouter(<HomePage />)
    
    const hotRoute = screen.getByText(/北京 → 上海/)
    fireEvent.click(hotRoute)
    
    const originInput = screen.getByLabelText('出发地') as HTMLInputElement
    const destinationInput = screen.getByLabelText('目的地') as HTMLInputElement
    
    expect(originInput.value).toBe('北京')
    expect(destinationInput.value).toBe('上海')
  })

  it('应该显示车次类型选项', () => {
    renderWithRouter(<HomePage />)
    
    // 验证所有车次类型选项都存在
    expect(screen.getByRole('option', { name: '全部' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '高速动车(G)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '动车(D)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '城际(C)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '特快(T)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '快速(K)' })).toBeInTheDocument()
  })

  it('应该在移动设备上正确显示', () => {
    // 模拟移动设备视口
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    renderWithRouter(<HomePage />)
    
    const searchForm = screen.getByRole('form')
    expect(searchForm).toBeInTheDocument()
    
    // 验证表单在移动设备上的布局
    expect(searchForm).toHaveClass('search-form')
  })

  it('应该支持键盘导航', () => {
    renderWithRouter(<HomePage />)
    
    const originInput = screen.getByLabelText('出发地')
    
    // 验证Tab键导航顺序
    originInput.focus()
    expect(document.activeElement).toBe(originInput)
    
    fireEvent.keyDown(originInput, { key: 'Tab' })
    // 在实际实现中，焦点应该移动到下一个元素
  })

  it('应该保存用户的搜索历史', () => {
    renderWithRouter(<HomePage />)
    
    // 填写并提交搜索表单
    fireEvent.change(screen.getByLabelText('出发地'), { target: { value: '北京' } })
    fireEvent.change(screen.getByLabelText('目的地'), { target: { value: '上海' } })
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    fireEvent.change(screen.getByLabelText('出发日期'), { target: { value: tomorrowStr } })
    
    const form = screen.getByRole('form')
    fireEvent.submit(form)
    
    // TODO: 验证搜索历史是否被保存到localStorage
    // 这需要在实现搜索历史功能后完善
  })
})