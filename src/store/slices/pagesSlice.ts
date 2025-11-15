import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { pagesAPI } from '../../services/api'
import type { Page } from '../../types'

interface PagesState {
  items: Page[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
  searchTerm: string
  lastFetched: number | null // timestamp for caching
}

const initialState: PagesState = {
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
  lastFetched: null,
}

// Async thunks
export const fetchPages = createAsyncThunk(
  'pages/fetchPages',
  async ({ page = 1, pageSize = 10, search = '' }: { page?: number; pageSize?: number; search?: string }) => {
    const response = await pagesAPI.getAll({ page, limit: pageSize, search: search || undefined })
    return {
      pages: response.data.pages,
      pagination: response.data.pagination,
      searchTerm: search,
    }
  }
)

export const deletePage = createAsyncThunk(
  'pages/deletePage',
  async (pageId: string) => {
    await pagesAPI.delete(pageId)
    return pageId
  }
)

export const createPage = createAsyncThunk(
  'pages/createPage',
  async (pageData: any) => {
    const response = await pagesAPI.create(pageData)
    return response.data
  }
)

export const updatePage = createAsyncThunk(
  'pages/updatePage',
  async ({ id, pageData }: { id: string; pageData: any }) => {
    const response = await pagesAPI.update(id, pageData)
    return response.data
  }
)

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
      state.pagination.page = 1 // Reset to first page when searching
    },
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.page = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },
    clearPages: (state) => {
      state.items = []
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.pages
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination,
        }
        state.searchTerm = action.payload.searchTerm
        state.lastFetched = Date.now()
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch pages'
      })
      .addCase(deletePage.fulfilled, (state, action) => {
        state.items = state.items.filter(page => page._id !== action.payload)
        state.pagination.totalItems -= 1
      })
      .addCase(createPage.fulfilled, (state) => {
        // Invalidate cache so the list refetches data
        state.lastFetched = null
      })
      .addCase(updatePage.fulfilled, (state) => {
        // Invalidate cache so the list refetches data
        state.lastFetched = null
      })
  },
})

export const { setSearchTerm, setPagination, clearPages } = pagesSlice.actions
export default pagesSlice.reducer