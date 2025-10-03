import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BlueprintForm from '../../src/components/BlueprintForm.jsx'

describe('BlueprintForm', () => {
  it('envía el formulario con puntos parseados', () => {
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByPlaceholderText(/juan.perez/i), {
      target: { value: 'john' },
    })
    fireEvent.change(screen.getByPlaceholderText(/mi-dibujo/i), {
      target: { value: 'house' },
    })
    fireEvent.change(screen.getByDisplayValue(/\[{"x":10,"y":10}/i), {
      target: { value: '[{"x":1,"y":2}]' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /Guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      author: 'john',
      name: 'house',
      points: [{ x: 1, y: 2 }],
    })
  })

  it('maneja JSON inválido mostrando alerta', () => {
    const onSubmit = vi.fn()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<BlueprintForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByDisplayValue(/\[{"x":10,"y":10}/i), {
      target: { value: 'json-invalido' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /Guardar/i }))

    expect(alertSpy).toHaveBeenCalledWith('JSON de puntos inválido')
    expect(onSubmit).not.toHaveBeenCalled()

    alertSpy.mockRestore()
  })

  it('renderiza con valores iniciales', () => {
    render(<BlueprintForm onSubmit={vi.fn()} />)

    expect(screen.getByDisplayValue('[{"x":10,"y":10},{"x":40,"y":60}]')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/juan.perez/i)).toHaveValue('')
    expect(screen.getByPlaceholderText(/mi-dibujo/i)).toHaveValue('')
  })

  it('actualiza los estados al escribir en los inputs', () => {
    render(<BlueprintForm onSubmit={vi.fn()} />)

    const authorInput = screen.getByPlaceholderText(/juan.perez/i)
    const nameInput = screen.getByPlaceholderText(/mi-dibujo/i)
    const pointsInput = screen.getByDisplayValue(/\[{"x":10,"y":10}/i)

    fireEvent.change(authorInput, { target: { value: 'maria' } })
    fireEvent.change(nameInput, { target: { value: 'casa' } })
    fireEvent.change(pointsInput, { target: { value: '[{"x":5,"y":5}]' } })

    expect(authorInput).toHaveValue('maria')
    expect(nameInput).toHaveValue('casa')
    expect(pointsInput).toHaveValue('[{"x":5,"y":5}]')
  })
})
