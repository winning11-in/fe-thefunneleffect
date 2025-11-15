import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  FormControlLabel,
  Switch,
  Chip,
  Autocomplete,
  IconButton,
} from "@mui/material";
import { Image } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createPlaylist, updatePlaylist } from "../store/slices/playlistsSlice";
import { fetchTracks } from "../store/slices/tracksSlice";
import { playlistsAPI } from "../services/api";
import ImageDialog from "../components/ImageDialog";
import type { CreatePlaylistData, Track } from "../types";

const playlistSchema = yup.object({
  title: yup.string().optional().max(200, "Title cannot be more than 200 characters"),
  description: yup.string().optional().max(500, "Description cannot be more than 500 characters"),
  duration: yup.string().optional(),
  thumbnail: yup.string().optional().url("Must be a valid URL"),
  createdBy: yup.string().optional().max(100, "Created by cannot be more than 100 characters"),
  tracks: yup.array().optional(),
  isPublic: yup.boolean().optional(),
  tags: yup.array().optional(),
});

const PlaylistForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.playlists);
  const { items: availableTracks } = useAppSelector((state) => state.tracks);

  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreatePlaylistData>({
    resolver: yupResolver(playlistSchema),
    defaultValues: {
      title: '',
      description: '',
      duration: '',
      thumbnail: '',
      createdBy: 'The Techodio',
      tracks: [],
      isPublic: true,
      tags: [],
    },
  });

  useEffect(() => {
    // Load available tracks for selection
    dispatch(fetchTracks({ page: 1, pageSize: 100 })); // Load more tracks for selection
  }, [dispatch]);

  useEffect(() => {
    if (isEditing && id) {
      setLoadingPlaylist(true);
      playlistsAPI
        .getById(id)
        .then((response) => {
          setSelectedTracks(response.data.tracks);
          reset({
            title: response.data.title || '',
            description: response.data.description || '',
            duration: response.data.duration || '',
            thumbnail: response.data.thumbnail || '',
            createdBy: response.data.createdBy || '',
            tracks: response.data.tracks.map(track => track._id),
            isPublic: response.data.isPublic,
            tags: response.data.tags,
          });
        })
        .catch((err) => {
          setError('Failed to load playlist');
          console.error('Error loading playlist:', err);
        })
        .finally(() => {
          setLoadingPlaylist(false);
        });
    }
  }, [id, isEditing, reset, dispatch]);

  const onSubmit = async (data: CreatePlaylistData) => {
    try {
      if (isEditing && id) {
        await dispatch(updatePlaylist({ id, playlistData: data })).unwrap();
      } else {
        await dispatch(createPlaylist(data)).unwrap();
      }
      navigate('/playlists');
    } catch (err) {
      console.error('Error saving playlist:', err);
    }
  };

  const handleTrackChange = (_event: any, newValue: Track[]) => {
    setSelectedTracks(newValue);
    setValue('tracks', newValue.map(track => track._id));
  };

  const handleTagChange = (_event: any, newValue: string[]) => {
    setValue('tags', newValue);
  };

  const handleImageSelect = (imageUrl: string) => {
    setValue('thumbnail', imageUrl);
  };

  if (loadingPlaylist) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Edit Playlist' : 'Create New Playlist'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ py: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Title
              </Typography>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Created By
              </Typography>
              <Controller
                name="createdBy"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={!!errors.createdBy}
                    helperText={errors.createdBy?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Description
              </Typography>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Total Duration
              </Typography>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="e.g., 45:30"
                    error={!!errors.duration}
                    helperText={errors.duration?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Thumbnail
              </Typography>
              <Box display="flex" gap={1}>
                <Controller
                  name="thumbnail"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Enter image URL or select from gallery"
                      error={!!errors.thumbnail}
                      helperText={errors.thumbnail?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                        },
                      }}
                    />
                  )}
                />
                <IconButton
                  onClick={() => setImageDialogOpen(true)}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <Image />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Tracks
              </Typography>
              <Controller
                name="tracks"
                control={control}
                render={() => (
                  <Autocomplete
                    multiple
                    options={availableTracks}
                    getOptionLabel={(option) => option.title || 'Untitled'}
                    value={selectedTracks}
                    onChange={handleTrackChange}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.title || 'Untitled'}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select tracks for this playlist"
                        error={!!errors.tracks}
                        helperText={errors.tracks?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1, fontSize: "13px" }}>
                Tags
              </Typography>
              <Controller
                name="tags"
                control={control}
                render={() => (
                  <Autocomplete
                    multiple
                    options={[]} // Allow free text entry
                    freeSolo
                    value={watch('tags') || []}
                    onChange={handleTagChange}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Add tags (press Enter to add)"
                        error={!!errors.tags}
                        helperText={errors.tags?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="isPublic"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Make playlist public"
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/playlists')}
              disabled={loading}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                px: 3,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                px: 3,
              }}
            >
              {loading ? (
                <CircularProgress
                  size={16}
                  style={{ color: "#fff", marginRight: "8px" }}
                />
              ) : (
                ""
              )}
              {loading ? 'Saving...' : (isEditing ? 'Update Playlist' : 'Create Playlist')}
            </Button>
          </Box>
        </form>
      </Box>

      <ImageDialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        onSelectImage={handleImageSelect}
      />
    </Box>
  );
};

export default PlaylistForm;