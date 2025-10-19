import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import HomePage from '../src/pages/HomePage'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Debug HomePage', () => {
  it('应该渲染基本元素', () => {
    renderWithRouter(<HomePage />)
    
    // 检查是否能找到基本元素
    const title = screen.getByText('火车票查询')
    expect(title).toBeInTheDocument()
  })
})