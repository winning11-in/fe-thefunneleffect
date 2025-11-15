import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { playlistsAPI } from '../../services/api'
import type { Playlist } from '../../types'

interface PlaylistsState {
  items: Playlist[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
  searchTerm: string
  createdByFilter: string
  isPublicFilter: string
  tagFilter: string
  lastFetched: number | null // timestamp for caching
  lastFetchParams: {
    page?: number
    pageSize?: number
    search?: string
    createdBy?: string
    isPublic?: boolean
    tag?: string
  } | null
}

const initialState: PlaylistsState = {
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
  createdByFilter: '',
  isPublicFilter: '',
  tagFilter: '',
  lastFetched: null,
  lastFetchParams: null,
}

// Async thunks
export const fetchPlaylists = createAsyncThunk(
  'playlists/fetchPlaylists',
  async ({ page = 1, pageSize = 10, search = '', createdBy = '', isPublic, tag = '' }: {
    page?: number;
    pageSize?: number;
    search?: string;
    createdBy?: string;
    isPublic?: boolean;
    tag?: string;
  }) => {
    const response = await playlistsAPI.getAll({
      page,
      limit: pageSize,
      search: search || undefined,
      createdBy: createdBy || undefined,
      isPublic: isPublic !== undefined ? isPublic.toString() : undefined,
      tag: tag || undefined
    })
    return {
      playlists: response.data.playlists || response.data.pages,
      pagination: {
        page: response.data.pagination.currentPage,
        pageSize: response.data.pagination.itemsPerPage,
        totalItems: response.data.pagination.totalItems,
        totalPages: response.data.pagination.totalPages,
      },
      searchTerm: search,
      createdByFilter: createdBy,
      isPublicFilter: isPublic !== undefined ? isPublic.toString() : '',
      tagFilter: tag,
    }
  }
)

export const createPlaylist = createAsyncThunk(
  'playlists/createPlaylist',
  async (playlistData: import('../../types').CreatePlaylistData) => {
    const response = await playlistsAPI.create(playlistData)
    return response.data
  }
)

export const updatePlaylist = createAsyncThunk(
  'playlists/updatePlaylist',
  async ({ id, playlistData }: { id: string; playlistData: import('../../types').CreatePlaylistData }) => {
    const response = await playlistsAPI.update(id, { ...playlistData, _id: id })
    return response.data
  }
)

export const deletePlaylist = createAsyncThunk(
  'playlists/deletePlaylist',
  async (playlistId: string) => {
    await playlistsAPI.delete(playlistId)
    return playlistId
  }
)

export const addTracksToPlaylist = createAsyncThunk(
  'playlists/addTracksToPlaylist',
  async ({ id, trackIds }: { id: string; trackIds: string[] }) => {
    const response = await playlistsAPI.addTracks(id, trackIds)
    return response.data
  }
)

export const removeTrackFromPlaylist = createAsyncThunk(
  'playlists/removeTrackFromPlaylist',
  async ({ id, trackId }: { id: string; trackId: string }) => {
    const response = await playlistsAPI.removeTrack(id, trackId)
    return response.data
  }
)

const playlistsSlice = createSlice({
  name: 'playlists',
  initialState,
  reducers: {
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.page = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    setCreatedByFilter: (state, action: PayloadAction<string>) => {
      state.createdByFilter = action.payload
    },
    setIsPublicFilter: (state, action: PayloadAction<string>) => {
      state.isPublicFilter = action.payload
    },
    setTagFilter: (state, action: PayloadAction<string>) => {
      state.tagFilter = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch playlists
      .addCase(fetchPlaylists.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.playlists
        state.pagination = action.payload.pagination
        state.searchTerm = action.payload.searchTerm
        state.createdByFilter = action.payload.createdByFilter || ''
        state.isPublicFilter = action.payload.isPublicFilter || ''
        state.tagFilter = action.payload.tagFilter || ''
        state.lastFetched = Date.now()
        state.lastFetchParams = action.meta.arg
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch playlists'
      })

      // Create playlist
      .addCase(createPlaylist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.loading = false
        state.items.unshift(action.payload)
        state.pagination.totalItems += 1
      })
      .addCase(createPlaylist.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create playlist'
      })

      // Update playlist
      .addCase(updatePlaylist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePlaylist.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(playlist => playlist._id === action.payload._id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updatePlaylist.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update playlist'
      })

      // Delete playlist
      .addCase(deletePlaylist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePlaylist.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(playlist => playlist._id !== action.payload)
        state.pagination.totalItems -= 1
      })
      .addCase(deletePlaylist.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete playlist'
      })

      // Add tracks to playlist
      .addCase(addTracksToPlaylist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addTracksToPlaylist.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(playlist => playlist._id === action.payload._id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(addTracksToPlaylist.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to add tracks to playlist'
      })

      // Remove track from playlist
      .addCase(removeTrackFromPlaylist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeTrackFromPlaylist.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(playlist => playlist._id === action.payload._id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(removeTrackFromPlaylist.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to remove track from playlist'
      })
  },
})

export const { setPagination, setSearchTerm, setCreatedByFilter, setIsPublicFilter, setTagFilter, clearError } = playlistsSlice.actions
export default playlistsSlice.reducer