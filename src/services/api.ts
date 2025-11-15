import axios, { AxiosResponse } from 'axios'
import { toast } from 'react-toastify'
import type { 
  Page, 
  CreatePageData, 
  UpdatePageData, 
  Track,
  CreateTrackData,
  UpdateTrackData,
  Playlist,
  CreatePlaylistData,
  UpdatePlaylistData,
  PaginatedResponse, 
  ApiResponse,
  AudioFoldersResponse
} from '../types'

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name'
const CLOUDINARY_UPLOAD_PRESET = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset'
const CLOUDINARY_AUDIO_UPLOAD_PRESET = (import.meta as any).env?.VITE_CLOUDINARY_AUDIO_UPLOAD_PRESET || 'da-orbit-audio'

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://da-pages-be.vercel.app/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('da-cms-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.message || 'An error occurred'
    
    // Handle 401 errors - token might be expired
    if (error.response?.status === 401) {
      // Only logout if this isn't a verify endpoint call (to avoid loops)
      if (!error.config?.url?.includes('/auth/verify')) {
        console.log('401 error on API call, logging out user')
        localStorage.removeItem('da-cms-token')
        // Force page reload to reset auth state
        window.location.reload()
      }
    }
    
    // Don't show snackbar for 404 errors when fetching individual items
    if (error.response?.status !== 404 && error.response?.status !== 401) {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// Pages API functions
export const pagesAPI = {
  // Get all pages with optional query parameters
  getAll: async (params: Record<string, any> = {}): Promise<PaginatedResponse<Page>> => {
    const response: AxiosResponse<PaginatedResponse<Page>> = await api.get('/pages', { params })
    return response.data
  },

  // Get page by slug
  getBySlug: async (slug: string): Promise<ApiResponse<Page>> => {
    const response: AxiosResponse<ApiResponse<Page>> = await api.get(`/pages/${slug}`)
    return response.data
  },

  // Get page by ID (for editing)
  getById: async (id: string): Promise<ApiResponse<Page>> => {
    const response: AxiosResponse<ApiResponse<Page>> = await api.get(`/pages/by-id/${id}`)
    return response.data
  },

  // Create new page
  create: async (pageData: CreatePageData): Promise<ApiResponse<Page>> => {
    const response: AxiosResponse<ApiResponse<Page>> = await api.post('/pages', pageData)
        toast.success('Page created successfully!')
    return response.data
  },

  // Update existing page
  update: async (id: string, pageData: UpdatePageData): Promise<ApiResponse<Page>> => {
    const response: AxiosResponse<ApiResponse<Page>> = await api.put(`/pages/${id}`, pageData)
    toast.success('Page updated successfully!')
    return response.data
  },

  // Delete page
  delete: async (id: string): Promise<ApiResponse<{ id: string; title: string }>> => {
    const response: AxiosResponse<ApiResponse<{ id: string; title: string }>> = await api.delete(`/pages/${id}`)
    toast.success('Page deleted successfully!')
    return response.data
  },
}

// Tracks API functions
export const tracksAPI = {
  // Get all tracks with optional query parameters
  getAll: async (params: Record<string, any> = {}): Promise<PaginatedResponse<Track>> => {
    const response: AxiosResponse<PaginatedResponse<Track>> = await api.get('/tracks', { params })
    return response.data
  },

  // Get track by ID
  getById: async (id: string): Promise<ApiResponse<Track>> => {
    const response: AxiosResponse<ApiResponse<Track>> = await api.get(`/tracks/${id}`)
    return response.data
  },

  // Create new track
  create: async (trackData: CreateTrackData): Promise<ApiResponse<Track>> => {
    const response: AxiosResponse<ApiResponse<Track>> = await api.post('/tracks', trackData)
    toast.success('Track created successfully!')
    return response.data
  },

  // Update existing track
  update: async (id: string, trackData: UpdateTrackData): Promise<ApiResponse<Track>> => {
    const response: AxiosResponse<ApiResponse<Track>> = await api.put(`/tracks/${id}`, trackData)
    toast.success('Track updated successfully!')
    return response.data
  },

  // Delete track
  delete: async (id: string): Promise<ApiResponse<{ id: string; title: string }>> => {
    const response: AxiosResponse<ApiResponse<{ id: string; title: string }>> = await api.delete(`/tracks/${id}`)
    toast.success('Track deleted successfully!')
    return response.data
  },
}

// Playlists API functions
export const playlistsAPI = {
  // Get all playlists with optional query parameters
  getAll: async (params: Record<string, any> = {}): Promise<PaginatedResponse<Playlist>> => {
    const response: AxiosResponse<PaginatedResponse<Playlist>> = await api.get('/playlists', { params })
    return response.data
  },

  // Get playlist by ID
  getById: async (id: string): Promise<ApiResponse<Playlist>> => {
    const response: AxiosResponse<ApiResponse<Playlist>> = await api.get(`/playlists/${id}`)
    return response.data
  },

  // Create new playlist
  create: async (playlistData: CreatePlaylistData): Promise<ApiResponse<Playlist>> => {
    const response: AxiosResponse<ApiResponse<Playlist>> = await api.post('/playlists', playlistData)
    toast.success('Playlist created successfully!')
    return response.data
  },

  // Update existing playlist
  update: async (id: string, playlistData: UpdatePlaylistData): Promise<ApiResponse<Playlist>> => {
    const response: AxiosResponse<ApiResponse<Playlist>> = await api.put(`/playlists/${id}`, playlistData)
    toast.success('Playlist updated successfully!')
    return response.data
  },

  // Delete playlist
  delete: async (id: string): Promise<ApiResponse<{ id: string; title: string }>> => {
    const response: AxiosResponse<ApiResponse<{ id: string; title: string }>> = await api.delete(`/playlists/${id}`)
    toast.success('Playlist deleted successfully!')
    return response.data
  },

  // Add tracks to playlist
  addTracks: async (id: string, trackIds: string[]): Promise<ApiResponse<Playlist>> => {
    const response: AxiosResponse<ApiResponse<Playlist>> = await api.put(`/playlists/${id}/tracks`, { trackIds })
    toast.success('Tracks added to playlist successfully!')
    return response.data
  },

  // Remove track from playlist
  removeTrack: async (id: string, trackId: string): Promise<ApiResponse<Playlist>> => {
    const response: AxiosResponse<ApiResponse<Playlist>> = await api.delete(`/playlists/${id}/tracks/${trackId}`)
    toast.success('Track removed from playlist successfully!')
    return response.data
  },
}

export default api

// Cloudinary upload function for images
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME)

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    if (response.data.secure_url) {
      toast.success('Image uploaded successfully!')
      return response.data.secure_url
    } else {
      throw new Error('Upload failed - no URL returned')
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    toast.error('Failed to upload image')
    throw error
  }
}

// Cloudinary upload function for audio
export const uploadAudioToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_AUDIO_UPLOAD_PRESET);
  formData.append('folder', 'da-orbit-audio'); // 👈 ensure uploaded to this folder

  try {
    // ✅ Audio files must use the `video/upload` endpoint
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    const { secure_url } = response.data;

    if (secure_url) {
      toast.success('🎧 Audio uploaded successfully!');
      return secure_url;
    }

    throw new Error('Upload failed — no secure URL returned from Cloudinary.');
  } catch (error: any) {
    console.error('❌ Cloudinary audio upload error:', error.response?.data || error.message);
    toast.error('Failed to upload audio');
    throw error;
  }
};

// Get uploaded images from Cloudinary
export const getUploadedImages = async (options?: { limit?: number; nextCursor?: string }): Promise<{
  images: Array<{ public_id: string; secure_url: string; created_at: string }>;
  nextCursor?: string;
  hasMore: boolean;
}> => {
  try {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.nextCursor) params.append('next_cursor', options.nextCursor);

    const queryString = params.toString();
    const url = `/images${queryString ? `?${queryString}` : ''}`;

    const response: AxiosResponse<{
      images: Array<{ public_id: string; secure_url: string; created_at: string }>;
      next_cursor?: string;
      has_more: boolean;
    }> = await api.get(url);

    return {
      images: response.data.images,
      nextCursor: response.data.next_cursor,
      hasMore: response.data.has_more
    };
  } catch (error) {
    console.error('Failed to fetch uploaded images:', error)
    toast.error('Failed to load uploaded images')
    return { images: [], hasMore: false };
  }
}

// Delete image from Cloudinary
export const deleteUploadedImage = async (publicId: string): Promise<{ publicId: string }> => {
  try {
    const response: AxiosResponse<{ message: string; publicId: string }> = await api.delete(`/images/${publicId}`)
    toast.success('Image deleted successfully!')
    return response.data
  } catch (error) {
    console.error('Failed to delete uploaded image:', error)
    toast.error('Failed to delete image')
    throw error
  }
}

// Get uploaded audios from Cloudinary
export const getUploadedAudios = async (options?: { limit?: number; nextCursor?: string }): Promise<{
  audios: Array<{ public_id: string; secure_url: string; created_at: string; name?: string }>;
  nextCursor?: string;
  hasMore: boolean;
}> => {
  try {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.nextCursor) params.append('next_cursor', options.nextCursor);

    const queryString = params.toString();
    const url = `/audios${queryString ? `?${queryString}` : ''}`;

    const response: AxiosResponse<{
      audios: Array<{ public_id: string; secure_url: string; created_at: string; name?: string }>;
      next_cursor?: string;
      has_more: boolean;
    }> = await api.get(url);

    return {
      audios: response.data.audios,
      nextCursor: response.data.next_cursor,
      hasMore: response.data.has_more
    };
  } catch (error) {
    console.error('Failed to fetch uploaded audios:', error)
    toast.error('Failed to load uploaded audios')
    return { audios: [], hasMore: false };
  }
}

// Delete audio from Cloudinary
export const deleteUploadedAudio = async (publicId: string): Promise<{ publicId: string }> => {
  try {
    const response: AxiosResponse<{ message: string; publicId: string }> = await api.delete(`/audios/${publicId}`)
    toast.success('Audio deleted successfully!')
    return response.data
  } catch (error) {
    console.error('Failed to delete uploaded audio:', error)
    toast.error('Failed to delete audio')
    throw error
  }
}

// Get audio folders structure from Cloudinary
export const getAudioFolders = async (): Promise<AudioFoldersResponse> => {
  try {
    const response: AxiosResponse<AudioFoldersResponse> = await api.get('/audio-folders')
    return response.data
  } catch (error) {
    console.error('Failed to fetch audio folders:', error)
    toast.error('Failed to load audio folders')
    throw error
  }
}