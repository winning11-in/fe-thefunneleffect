import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { pagesAPI } from '../../services/api'
import type { Page } from '../../types'

interface DashboardState {
  recentPages: Page[]
  totalPages: number
  loading: boolean
  error: string | null
  lastFetched: number | null // timestamp for caching
}

const initialState: DashboardState = {
  recentPages: [],
  totalPages: 0,
  loading: false,
  error: null,
  lastFetched: null,
}

// Async thunk to fetch dashboard data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async () => {
    const pagesResponse = await pagesAPI.getAll({ limit: 5, page: 1 })

    return {
      recentPages: pagesResponse.data.pages,
      totalPages: pagesResponse.data.pagination.totalItems,
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      state.recentPages = []
      state.totalPages = 0
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false
        state.recentPages = action.payload.recentPages
        state.totalPages = action.payload.totalPages
        state.lastFetched = Date.now()
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch dashboard data'
      })
  },
})

export const { clearDashboardData } = dashboardSlice.actions
export default dashboardSlice.reducer