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
  groupFilter: string
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
  groupFilter: '',
  lastFetched: null,
}

// Async thunks
export const fetchPages = createAsyncThunk(
  'pages/fetchPages',
  async ({ page = 1, pageSize = 10, search = '', group = '' }: { page?: number; pageSize?: number; search?: string; group?: string }) => {
    const params: any = { page, limit: pageSize }
    if (search) params.search = search
    if (group) params.group = group
    
    const response = await pagesAPI.getAll(params)
    return {
      pages: response.data.pages,
      pagination: response.data.pagination,
      searchTerm: search,
      groupFilter: group,
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
    setGroupFilter: (state, action: PayloadAction<string>) => {
      state.groupFilter = action.payload
      state.pagination.page = 1 // Reset to first page when filtering
    },
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.page = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },
    clearPages: (state) => {
      state.items = []
      state.lastFetched = null
    },
    forceRefresh: (state) => {
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPages.pending, (state) => {
        // Only show loading if we don't have cached data
        state.loading = state.items.length === 0
        state.error = null
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.pages
        // Update pagination with response data, keeping page and pageSize from state
        state.pagination = {
          page: state.pagination.page,
          pageSize: state.pagination.pageSize,
          totalItems: action.payload.pagination.totalItems,
          totalPages: action.payload.pagination.totalPages,
        }
        state.searchTerm = action.payload.searchTerm
        state.groupFilter = action.payload.groupFilter
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

export const { setSearchTerm, setGroupFilter, setPagination, clearPages, forceRefresh } = pagesSlice.actions
export default pagesSlice.reducer