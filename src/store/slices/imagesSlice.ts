import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getUploadedImages, deleteUploadedImage } from '../../services/api'
import type { Image } from '../../types'

interface ImagesState {
  items: Image[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  lastFetched: number | null // timestamp for caching
  nextCursor: string | null
  hasMore: boolean
}

const initialState: ImagesState = {
  items: [],
  loading: false,
  loadingMore: false,
  error: null,
  lastFetched: null,
  nextCursor: null,
  hasMore: false,
}

// Async thunk to fetch uploaded images
export const fetchImages = createAsyncThunk(
  'images/fetchImages',
  async () => {
    const result = await getUploadedImages({ limit: 10 })
    return result
  }
)

// Async thunk to load more images
export const loadMoreImages = createAsyncThunk(
  'images/loadMoreImages',
  async (nextCursor: string) => {
    const result = await getUploadedImages({ limit: 10, nextCursor })
    return result
  }
)

// Async thunk to delete an image
export const deleteImage = createAsyncThunk(
  'images/deleteImage',
  async (publicId: string) => {
    await deleteUploadedImage(publicId)
    return publicId
  }
)

const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    clearImages: (state) => {
      state.items = []
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchImages.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.images
        state.nextCursor = action.payload.nextCursor || null
        state.hasMore = action.payload.hasMore
        state.lastFetched = Date.now()
      })
      .addCase(fetchImages.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch images'
      })
      .addCase(loadMoreImages.pending, (state) => {
        state.loadingMore = true
        state.error = null
      })
      .addCase(loadMoreImages.fulfilled, (state, action) => {
        state.loadingMore = false
        state.items = [...state.items, ...action.payload.images]
        state.nextCursor = action.payload.nextCursor || null
        state.hasMore = action.payload.hasMore
      })
      .addCase(loadMoreImages.rejected, (state, action) => {
        state.loadingMore = false
        state.error = action.error.message || 'Failed to load more images'
      })
      .addCase(deleteImage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(image => image.public_id !== action.payload)
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete image'
      })
  },
})

export const { clearImages } = imagesSlice.actions
export default imagesSlice.reducer