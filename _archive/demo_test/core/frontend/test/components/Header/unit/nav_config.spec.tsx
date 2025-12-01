import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from '../../../../src/components/Header.jsx'

describe('Header 单元测试 - 导航配置验证', () => {
  it('主导航仅对首页与车票提供跳转链接', () => {
    const { container } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )
    const anchors = Array.from(container.querySelectorAll('.main-nav-bar a.nav-item')) as HTMLAnchorElement[]
    const map = anchors.map(a => [a.textContent?.trim()?.replace(/\s+⌄$/, ''), a.getAttribute('href')])
    expect(map).toEqual([
      ['首页', '/'],
      ['车票', '/search'],
    ])
  })
})
