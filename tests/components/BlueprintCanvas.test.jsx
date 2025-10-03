import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import BlueprintCanvas from '../../src/components/BlueprintCanvas.jsx'

const mockContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
}

describe('BlueprintCanvas', () => {
  let getContextSpy

  beforeEach(() => {
    getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    getContextSpy.mockReturnValue(mockContext)
  })

  afterEach(() => {
    getContextSpy.mockRestore()
    vi.clearAllMocks()
  })

  it('renderiza canvas con dimensiones por defecto', () => {
    const { container } = render(<BlueprintCanvas />)
    const canvas = container.querySelector('canvas')

    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveAttribute('width', '520')
    expect(canvas).toHaveAttribute('height', '360')
  })

  it('renderiza con dimensiones personalizadas', () => {
    const { container } = render(<BlueprintCanvas width={800} height={600} />)
    const canvas = container.querySelector('canvas')

    expect(canvas).toHaveAttribute('width', '800')
    expect(canvas).toHaveAttribute('height', '600')
  })

  it('dibuja el fondo correctamente', () => {
    render(<BlueprintCanvas points={[]} />)

    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 520, 360)
    expect(mockContext.fillStyle).toBe('#0b1220')
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 520, 360)
  })

  it('maneja array vacío de puntos', () => {
    render(<BlueprintCanvas points={[]} />)

    expect(mockContext.clearRect).toHaveBeenCalled()
    expect(mockContext.fillRect).toHaveBeenCalled()
  })

  it('aplica estilos CSS correctos', () => {
    const { container } = render(<BlueprintCanvas />)
    const canvas = container.querySelector('canvas')

    expect(canvas).toHaveStyle({
      background: '#0b1220',
      border: '1px solid #334155',
      borderRadius: '12px',
    })
  })

  it('renderiza con puntos y llama a getContext', () => {
    const points = [
      { x: 10, y: 10 },
      { x: 50, y: 60 },
    ]

    const { container } = render(<BlueprintCanvas points={points} />)

    expect(container.querySelector('canvas')).toBeInTheDocument()
    expect(getContextSpy).toHaveBeenCalledWith('2d')
  })
})
