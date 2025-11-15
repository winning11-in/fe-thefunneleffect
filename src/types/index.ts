export interface Page {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  audioUrl?: string;
  groups: string[];
  editorType: "summernote" | "quill";
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  _id: string;
  title?: string;
  author?: string;
  description?: string;
  duration?: string;
  listeners?: string;
  date?: string;
  thumbnail?: string;
  category?: string;
  trending?: boolean;
  audioUrl?: string;
  playlists?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  _id: string;
  title?: string;
  description?: string;
  trackCount: number;
  duration?: string;
  thumbnail?: string;
  createdBy?: string;
  createdAt: string;
  tracks: Track[];
  isPublic: boolean;
  tags: string[];
  updatedAt: string;
}

export interface Image {
  public_id: string;
  secure_url: string;
  created_at: string;
}

export interface Audio {
  public_id: string;
  secure_url: string;
  created_at: string;
  name?: string;
  folder?: string;
}

export interface AudioFolder {
  name: string;
  path: string;
  audios: Audio[];
  audioCount: number;
}

export interface AudioFoldersResponse {
  folders: AudioFolder[];
  totalFolders: number;
  totalAudios: number;
}

export interface CreatePageData {
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  audioUrl?: string;
  groups: string[];
  editorType: "summernote" | "quill";
  slug?: string;
  content?: string;
  aiReferences?: string;
}

export interface UpdatePageData extends CreatePageData {
  _id: string;
}

export interface CreateTrackData {
  title?: string;
  author?: string;
  description?: string;
  duration?: string;
  listeners?: string;
  date?: string;
  thumbnail?: string;
  category?: string;
  trending?: boolean;
  audioUrl?: string;
  playlistId?: string;
}

export interface UpdateTrackData extends CreateTrackData {
  _id: string;
}

export interface CreatePlaylistData {
  title?: string;
  description?: string;
  duration?: string;
  thumbnail?: string;
  createdBy?: string;
  tracks?: string[];
  isPublic?: boolean;
  tags?: string[];
}

export interface UpdatePlaylistData extends CreatePlaylistData {
  _id: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    pages: T[];
    tracks?: T[];
    playlists?: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
