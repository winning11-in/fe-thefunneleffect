import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { tracksAPI } from '../../services/api'
import type { Track } from '../../types'

interface TracksState {
  items: Track[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
  searchTerm: string
  categoryFilter: string
  authorFilter: string
  lastFetched: number | null // timestamp for caching
  lastFetchParams: {
    page?: number
    pageSize?: number
    search?: string
    category?: string
    author?: string
  } | null
}

const initialState: TracksState = {
  items: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  searchTerm: '',
  categoryFilter: '',
  authorFilter: '',
  lastFetched: null,
  lastFetchParams: null,
}

// Async thunks
export const fetchTracks = createAsyncThunk(
  'tracks/fetchTracks',
  async ({ page = 1, pageSize = 10, search = '', category = '', author = '' }: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    author?: string;
  }) => {
    const response = await tracksAPI.getAll({
      page,
      limit: pageSize,
      search: search || undefined,
      category: category || undefined,
      author: author || undefined
    })
    return {
      tracks: response.data.tracks || response.data.pages,
      pagination: {
        page: response.data.pagination.currentPage,
        pageSize: response.data.pagination.itemsPerPage,
        totalItems: response.data.pagination.totalItems,
        totalPages: response.data.pagination.totalPages,
      },
      searchTerm: search,
      categoryFilter: category,
      authorFilter: author,
    }
  }
)

export const createTrack = createAsyncThunk(
  'tracks/createTrack',
  async (trackData: Omit<Track, '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await tracksAPI.create(trackData)
    return response.data
  }
)

export const updateTrack = createAsyncThunk(
  'tracks/updateTrack',
  async ({ id, trackData }: { id: string; trackData: Omit<Track, '_id' | 'createdAt' | 'updatedAt'> }) => {
    const response = await tracksAPI.update(id, { ...trackData, _id: id })
    return response.data
  }
)

export const deleteTrack = createAsyncThunk(
  'tracks/deleteTrack',
  async (trackId: string) => {
    await tracksAPI.delete(trackId)
    return trackId
  }
)

const tracksSlice = createSlice({
  name: 'tracks',
  initialState,
  reducers: {
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.page = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload
    },
    setAuthorFilter: (state, action: PayloadAction<string>) => {
      state.authorFilter = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tracks
      .addCase(fetchTracks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTracks.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.tracks
        state.pagination = action.payload.pagination
        state.searchTerm = action.payload.searchTerm
        state.categoryFilter = action.payload.categoryFilter || ''
        state.authorFilter = action.payload.authorFilter || ''
        state.lastFetched = Date.now()
        state.lastFetchParams = action.meta.arg
      })
      .addCase(fetchTracks.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch tracks'
      })

      // Create track
      .addCase(createTrack.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTrack.fulfilled, (state, action) => {
        state.loading = false
        state.items.unshift(action.payload)
        state.pagination.totalItems += 1
      })
      .addCase(createTrack.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create track'
      })

      // Update track
      .addCase(updateTrack.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTrack.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(track => track._id === action.payload._id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateTrack.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update track'
      })

      // Delete track
      .addCase(deleteTrack.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteTrack.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(track => track._id !== action.payload)
        state.pagination.totalItems -= 1
      })
      .addCase(deleteTrack.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete track'
      })
  },
})

export const { setPagination, setSearchTerm, setCategoryFilter, setAuthorFilter, clearError } = tracksSlice.actions
export default tracksSlice.reducer