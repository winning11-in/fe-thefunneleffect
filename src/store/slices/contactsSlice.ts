import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { contactsAPI } from '../../services/api'
import type { Contact } from '../../types'

interface ContactsState {
  items: Contact[]
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

const initialState: ContactsState = {
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
export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async ({ page = 1, pageSize = 10, search = '' }: { page?: number; pageSize?: number; search?: string }) => {
    const response = await contactsAPI.getAll({ page, limit: pageSize, search: search || undefined })
    return {
      contacts: response.data,
      pagination: {
        currentPage: response.page,
        totalPages: response.totalPages,
        totalItems: response.total,
        itemsPerPage: response.limit,
      },
      searchTerm: search,
    }
  }
)

export const deleteContactById = createAsyncThunk(
  'contacts/deleteContact',
  async (contactId: string) => {
    await contactsAPI.delete(contactId)
    return contactId
  }
)

const contactsSlice = createSlice({
  name: 'contacts',
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
    clearContacts: (state) => {
      state.items = []
      state.lastFetched = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.contacts
        // Update pagination with response data, keeping page and pageSize from state
        state.pagination = {
          page: state.pagination.page,
          pageSize: state.pagination.pageSize,
          totalItems: action.payload.pagination.totalItems,
          totalPages: action.payload.pagination.totalPages,
        }
        state.searchTerm = action.payload.searchTerm
        state.lastFetched = Date.now()
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch contacts'
      })
      .addCase(deleteContactById.pending, (state) => {
        state.error = null
      })
      .addCase(deleteContactById.fulfilled, (state, action) => {
        const filteredItems = state.items.filter(contact => contact._id !== action.payload)
        state.items = filteredItems
        state.pagination.totalItems -= 1
        // If this was the last item on the current page and we're not on page 1,
        // we should go back to the previous page
        if (filteredItems.length === 0 && state.pagination.page > 1) {
          state.pagination.page -= 1
        }
      })
      .addCase(deleteContactById.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete contact'
      })
  },
})

export const { setSearchTerm, setPagination, clearContacts, clearError } = contactsSlice.actions
export default contactsSlice.reducer