import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getUploadedAudios, deleteUploadedAudio, getAudioFolders } from '../../services/api'
import type { Audio, AudioFolder } from '../../types'

interface AudiosState {
  items: Audio[]
  folders: AudioFolder[]
  loading: boolean
  loadingFolders: boolean
  loadingMore: boolean
  error: string | null
  lastFetched: number | null // timestamp for caching
  lastFetchedFolders: number | null // timestamp for caching folders
  nextCursor: string | null
  hasMore: boolean
  viewMode: 'flat' | 'folders' // Add view mode
}

const initialState: AudiosState = {
  items: [],
  folders: [],
  loading: false,
  loadingFolders: false,
  loadingMore: false,
  error: null,
  lastFetched: null,
  lastFetchedFolders: null,
  nextCursor: null,
  hasMore: false,
  viewMode: 'folders', // Default to folders view
}

// Async thunk to fetch uploaded audios
export const fetchAudios = createAsyncThunk(
  'audios/fetchAudios',
  async () => {
    const result = await getUploadedAudios({ limit: 10 })
    return result
  }
)

// Async thunk to load more audios
export const loadMoreAudios = createAsyncThunk(
  'audios/loadMoreAudios',
  async (nextCursor: string) => {
    const result = await getUploadedAudios({ limit: 10, nextCursor })
    return result
  }
)

// Async thunk to delete an audio
export const deleteAudio = createAsyncThunk(
  'audios/deleteAudio',
  async (publicId: string) => {
    await deleteUploadedAudio(publicId)
    return publicId
  }
)

// Async thunk to fetch audio folders
export const fetchAudioFolders = createAsyncThunk(
  'audios/fetchAudioFolders',
  async () => {
    const result = await getAudioFolders()
    return result
  }
)

// Remove audio locally (for optimistic updates)
export const removeAudioLocally = createAsyncThunk(
  'audios/removeAudioLocally',
  async (publicId: string) => {
    return publicId
  }
)

const audiosSlice = createSlice({
  name: 'audios',
  initialState,
  reducers: {
    clearAudios: (state) => {
      state.items = []
      state.lastFetched = null
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAudios.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAudios.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.audios
        state.nextCursor = action.payload.nextCursor || null
        state.hasMore = action.payload.hasMore
        state.lastFetched = Date.now()
      })
      .addCase(fetchAudios.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch audios'
      })
      .addCase(loadMoreAudios.pending, (state) => {
        state.loadingMore = true
        state.error = null
      })
      .addCase(loadMoreAudios.fulfilled, (state, action) => {
        state.loadingMore = false
        state.items = [...state.items, ...action.payload.audios]
        state.nextCursor = action.payload.nextCursor || null
        state.hasMore = action.payload.hasMore
      })
      .addCase(loadMoreAudios.rejected, (state, action) => {
        state.loadingMore = false
        state.error = action.error.message || 'Failed to load more audios'
      })
      .addCase(deleteAudio.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAudio.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(audio => audio.public_id !== action.payload)
      })
      .addCase(deleteAudio.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete audio'
      })
      .addCase(removeAudioLocally.fulfilled, (state, action) => {
        state.items = state.items.filter(audio => audio.public_id !== action.payload)
      })
      .addCase(fetchAudioFolders.pending, (state) => {
        state.loadingFolders = true
        state.error = null
      })
      .addCase(fetchAudioFolders.fulfilled, (state, action) => {
        state.loadingFolders = false
        state.folders = action.payload.folders
        state.lastFetchedFolders = Date.now()
      })
      .addCase(fetchAudioFolders.rejected, (state, action) => {
        state.loadingFolders = false
        state.error = action.error.message || 'Failed to fetch audio folders'
      })
  },
})

export const { clearAudios, setViewMode } = audiosSlice.actions
export default audiosSlice.reducer