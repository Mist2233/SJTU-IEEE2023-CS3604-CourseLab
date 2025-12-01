import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

const mockedNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockedNavigate }
})

import HomePage from '../../../../src/pages/P001/HomePage.jsx'

describe('P001 集成测试 - 查询跳转逻辑', () => {
  it('填写完整后点击查询触发导航且携带state', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )
    const [fromInput, toInput] = container.querySelectorAll('input[type="text"]')
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement
    const [studentCheckbox, highSpeedCheckbox] = container.querySelectorAll('input[type="checkbox"]')
    await user.click(fromInput as HTMLElement)
    await user.type(fromInput as HTMLInputElement, '北京')
    const close1 = container.querySelector('.station-close') as HTMLElement
    if (close1) await user.click(close1)
    await user.click(toInput as HTMLElement)
    await user.type(toInput as HTMLInputElement, '上海')
    const close2 = container.querySelector('.station-close') as HTMLElement
    if (close2) await user.click(close2)
    await new Promise(r => setTimeout(r, 0))
    const searchBtn = container.querySelector('.hero-search-btn')
    await user.click(searchBtn as HTMLElement)
    await new Promise(r => setTimeout(r, 0))
    expect(mockedNavigate).toHaveBeenCalled()
    const calls = mockedNavigate.mock.calls
    const args = calls[calls.length - 1] as any
    expect(args[0]).toBe('/search')
    const stateArg = args[1]?.state
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const todayStr = fmt(new Date())
    expect(stateArg).toEqual({ from: '北京', to: '上海', date: todayStr, isStudent: false, isHighSpeed: false })
  })
})
