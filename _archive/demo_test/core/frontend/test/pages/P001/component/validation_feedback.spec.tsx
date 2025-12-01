import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '../../../../src/pages/P001/HomePage.jsx'
import { vi } from 'vitest'

describe('P001 组件测试 - 表单校验反馈', () => {
  it('出发地和到达地为空时点击查询显示错误提示', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )
    const searchBtn = container.querySelector('.hero-search-btn')
    await user.click(searchBtn as HTMLElement)
    expect(screen.getByText('请输入出发地和目的地')).toBeInTheDocument()
  })
})
