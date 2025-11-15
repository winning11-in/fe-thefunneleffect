import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import pagesSlice from './slices/pagesSlice'
import dashboardSlice from './slices/dashboardSlice'
import tracksSlice from './slices/tracksSlice'
import playlistsSlice from './slices/playlistsSlice'
import imagesSlice from './slices/imagesSlice'
import audiosSlice from './slices/audiosSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    pages: pagesSlice,
    dashboard: dashboardSlice,
    tracks: tracksSlice,
    playlists: playlistsSlice,
    images: imagesSlice,
    audios: audiosSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch