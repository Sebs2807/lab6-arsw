import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import blueprintsReducer, {
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
  addPoint,
  createBlueprint,
} from '../../../src/features/blueprints/blueprintsSlice.js'

vi.mock('../../../src/services/blueprintsService.js', () => ({
  default: {
    getAll: vi.fn(),
    getByAuthor: vi.fn(),
    getByAuthorAndName: vi.fn(),
    addPoint: vi.fn(),
    create: vi.fn(),
  },
}))

describe('blueprintsSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const initialState = {
    authors: [],
    byAuthor: {},
    current: null,
    status: 'idle',
    error: null,
  }

  describe('initial state', () => {
    it('should initialize correctly', () => {
      const state = blueprintsReducer(undefined, { type: '@@INIT' })
      expect(state).toEqual(initialState)
    })
  })

  describe('fetchAuthors', () => {
    it('should handle fetchAuthors.pending', () => {
      const action = { type: fetchAuthors.pending.type }
      const state = blueprintsReducer(initialState, action)

      expect(state.status).toBe('loading')
      expect(state.error).toBeNull()
    })

    it('should handle fetchAuthors.fulfilled', () => {
      const mockAuthors = ['john', 'jane', 'bob']
      const action = {
        type: fetchAuthors.fulfilled.type,
        payload: mockAuthors,
      }
      const state = blueprintsReducer(initialState, action)

      expect(state.status).toBe('succeeded')
      expect(state.authors).toEqual(mockAuthors)
      expect(state.error).toBeNull()
    })

    it('should handle fetchAuthors.rejected', () => {
      const errorMessage = 'Failed to fetch authors'
      const action = {
        type: fetchAuthors.rejected.type,
        error: { message: errorMessage },
      }
      const state = blueprintsReducer(initialState, action)

      expect(state.status).toBe('failed')
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('fetchByAuthor', () => {
    it('should handle fetchByAuthor.fulfilled', () => {
      const mockAuthor = 'john'
      const mockItems = [
        { author: 'john', name: 'house', points: [] },
        { author: 'john', name: 'building', points: [] },
      ]

      const action = {
        type: fetchByAuthor.fulfilled.type,
        payload: { author: mockAuthor, items: mockItems },
      }
      const state = blueprintsReducer(initialState, action)

      expect(state.byAuthor[mockAuthor]).toEqual(mockItems)
    })
  })

  describe('fetchBlueprint', () => {
    it('should handle fetchBlueprint.fulfilled', () => {
      const mockBlueprint = {
        author: 'john',
        name: 'house',
        points: [
          { x: 10, y: 10 },
          { x: 20, y: 20 },
        ],
      }

      const action = {
        type: fetchBlueprint.fulfilled.type,
        payload: mockBlueprint,
      }
      const state = blueprintsReducer(initialState, action)

      expect(state.current).toEqual(mockBlueprint)
    })
  })

  describe('addPoint', () => {
    it('should handle addPoint.fulfilled', () => {
      const initialBlueprintsState = {
        ...initialState,
        byAuthor: {
          john: [
            {
              author: 'john',
              name: 'house',
              points: [{ x: 10, y: 10 }],
            },
          ],
        },
      }

      const newPoint = { x: 20, y: 20 }
      const action = {
        type: addPoint.fulfilled.type,
        payload: {
          author: 'john',
          name: 'house',
          point: newPoint,
        },
      }

      const state = blueprintsReducer(initialBlueprintsState, action)

      expect(state.byAuthor['john'][0].points).toHaveLength(2)
      expect(state.byAuthor['john'][0].points[1]).toEqual(newPoint)
    })
  })

  describe('createBlueprint', () => {
    it('should handle createBlueprint.fulfilled for new author', () => {
      const newBlueprint = {
        author: 'newuser',
        name: 'first-design',
        points: [{ x: 1, y: 1 }],
      }

      const action = {
        type: createBlueprint.fulfilled.type,
        payload: newBlueprint,
      }
      const state = blueprintsReducer(initialState, action)

      expect(state.byAuthor['newuser']).toEqual([newBlueprint])
    })
  })
})
