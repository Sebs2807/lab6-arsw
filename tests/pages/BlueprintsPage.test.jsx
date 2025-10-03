import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import BlueprintsPage from '../../src/pages/BlueprintsPage.jsx'

vi.mock('../../src/features/blueprints/blueprintsSlice.js', () => ({
  fetchAuthors: () => ({ type: 'blueprints/fetchAuthors' }),
  fetchByAuthor: (author) => ({ type: 'blueprints/fetchByAuthor', payload: author }),
  fetchBlueprint: (payload) => ({ type: 'blueprints/fetchBlueprint', payload }),
}))

vi.mock('../../src/components/BlueprintCanvas.jsx', () => ({
  default: ({ points = [], width = 520, height = 360 }) => (
    <div
      data-testid="mock-blueprint-canvas"
      data-points={JSON.stringify(points)}
      data-width={width}
      data-height={height}
    >
      Mock Blueprint Canvas - Points: {points.length} - Size: {width}x{height}
    </div>
  ),
}))

function makeStore(preloadedState = {}) {
  const slice = createSlice({
    name: 'blueprints',
    initialState: {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
      ...preloadedState,
    },
    reducers: {},
  })
  return configureStore({ reducer: { blueprints: slice.reducer } })
}

describe('BlueprintsPage', () => {
  it('despacha fetchByAuthor al hacer click en Get blueprints', () => {
    const store = makeStore()
    const spy = vi.spyOn(store, 'dispatch')
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.change(screen.getByPlaceholderText(/Author/i), { target: { value: 'JohnConnor' } })
    fireEvent.click(screen.getByText(/Get blueprints/i))

    expect(spy).toHaveBeenCalledWith({ type: 'blueprints/fetchByAuthor', payload: 'JohnConnor' })
  })

  it('muestra el estado de carga correctamente', () => {
    const store = makeStore({ status: 'loading' })

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('muestra blueprints cuando hay datos', () => {
    const store = makeStore({
      byAuthor: {
        john: [
          { author: 'john', name: 'house', points: [{ x: 1, y: 1 }] },
          {
            author: 'john',
            name: 'car',
            points: [
              { x: 2, y: 2 },
              { x: 3, y: 3 },
            ],
          },
        ],
      },
    })

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    // Establece el autor seleccionado
    fireEvent.change(screen.getByPlaceholderText(/Author/i), { target: { value: 'john' } })
    fireEvent.click(screen.getByText(/Get blueprints/i))

    expect(screen.getByText('house')).toBeInTheDocument()
    expect(screen.getByText('car')).toBeInTheDocument()
    expect(screen.getByText('Total user points: 3')).toBeInTheDocument()
  })

  it('muestra mensaje cuando no hay resultados', () => {
    const store = makeStore({ status: 'succeeded' })

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    expect(screen.getByText('Sin resultados.')).toBeInTheDocument()
  })

  it('actualiza el autor input correctamente', () => {
    const store = makeStore()

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    const authorInput = screen.getByPlaceholderText(/Author/i)
    fireEvent.change(authorInput, { target: { value: 'testuser' } })

    expect(authorInput.value).toBe('testuser')
  })

  it('muestra el blueprint actual en el canvas', () => {
    const currentBlueprint = {
      author: 'john',
      name: 'house',
      points: [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ],
    }

    const store = makeStore({ current: currentBlueprint })

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    expect(screen.getByText('Current blueprint: house')).toBeInTheDocument()
    expect(screen.getByTestId('mock-blueprint-canvas')).toBeInTheDocument()
    expect(
      screen.getByText('Mock Blueprint Canvas - Points: 2 - Size: 520x360'),
    ).toBeInTheDocument()
  })
})
