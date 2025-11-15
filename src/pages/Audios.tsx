import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Input,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Folder as FolderIcon,
  GridView as GridViewIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchAudios,
  loadMoreAudios,
  fetchAudioFolders,
  setViewMode,
} from "../store/slices/audiosSlice";
import { uploadAudioToCloudinary } from "../services/api";

const Audios: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    items: audios,
    folders,
    loading,
    loadingFolders,
    loadingMore,
    error,
    lastFetched,
    lastFetchedFolders,
    hasMore,
    nextCursor,
    viewMode,
  } = useAppSelector((state) => state.audios);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (viewMode === 'folders') {
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      const shouldFetch =
        !lastFetchedFolders || Date.now() - lastFetchedFolders > CACHE_DURATION;

      if (shouldFetch) {
        dispatch(fetchAudioFolders());
      }
    } else {
      const CACHE_DURATION = 5 * 60 * 1000;
      const shouldFetch =
        !lastFetched || Date.now() - lastFetched > CACHE_DURATION;

      if (shouldFetch) {
        dispatch(fetchAudios());
      }
    }
  }, [dispatch, lastFetched, lastFetchedFolders, viewMode]);

  useEffect(() => {
    if (playingId) {
      const audio = document.querySelector(`audio[data-id="${playingId}"]`) as HTMLAudioElement;
      if (audio) audio.play();
    } else {
      document.querySelectorAll('audio').forEach(a => a.pause());
    }
  }, [playingId]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadLoading(true);
      try {
        await uploadAudioToCloudinary(file);
        // Reset file input
        const fileInput = document.getElementById(
          "audio-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        // Refresh audios list
        dispatch(fetchAudios());
      } catch (error) {
        console.error("Audio upload failed:", error);
      } finally {
        setUploadLoading(false);
      }
    }
  };

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: 'flat' | 'folders' | null,
  ) => {
    if (newViewMode !== null) {
      dispatch(setViewMode(newViewMode));
    }
  };

  const handlePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  const handleFolderClick = (folder: any) => {
    navigate(`/audios/folder/${encodeURIComponent(folder.path)}`);
  };

  if (loading || loadingFolders) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h6" component="h1" gutterBottom>
            Uploaded Audios
          </Typography>
          <Skeleton
            variant="rectangular"
            width={140}
            height={36}
            sx={{ borderRadius: "8px" }}
          />
        </Box>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "none",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                }}
              >
                <Skeleton
                  variant="rectangular"
                  height={200}
                  sx={{ borderRadius: "8px 8px 0 0" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton variant="text" width="80%" height={16} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" component="h1" gutterBottom>
          Uploaded Audios
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="folders" aria-label="folder view">
              <FolderIcon />
            </ToggleButton>
            <ToggleButton value="flat" aria-label="grid view">
              <GridViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>

          <Input
            type="file"
            inputProps={{ accept: "audio/*" }}
            id="audio-upload"
            onChange={handleFileSelect}
            sx={{ display: "none" }}
          />
          <Button
            variant="contained"
            component="label"
            htmlFor="audio-upload"
            startIcon={
              uploadLoading ? (
                <CircularProgress size={16} />
              ) : (
                <CloudUploadIcon />
              )
            }
            disabled={uploadLoading}
            sx={{ borderRadius: "8px", boxShadow: "none" }}
          >
            {uploadLoading ? "Uploading..." : "Upload Audio"}
          </Button>
        </Box>
      </Box>

      {viewMode === 'folders' ? (
        // Folder view
        folders.length === 0 ? (
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              No audio folders found.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {folders.map((folder) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={folder.path}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "none",
                    position: "relative",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "#1976d2",
                      boxShadow: "0 2px 8px rgba(25, 118, 210, 0.2)",
                    },
                  }}
                  onClick={() => handleFolderClick(folder)}
                >
                  <Box
                    sx={{
                      height: 200,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px 8px 0 0",
                      "&:hover": {
                        backgroundColor: "#e8f4fd",
                      },
                    }}
                  >
                    <FolderIcon sx={{ fontSize: 64, color: "#1976d2", mb: 1 }} />
                    <Typography variant="h6" sx={{ color: "#1976d2", textAlign: "center" }}>
                      {folder.name}
                    </Typography>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {folder.audioCount} audio{folder.audioCount !== 1 ? 's' : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {folder.path}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        // Flat grid view
        audios.length === 0 ? (
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              No audios uploaded yet.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {audios.map((audio) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={audio.public_id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "none",
                    position: "relative",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                  }}
                >
                  <Box
                    onClick={() => handlePlay(audio.public_id)}
                    sx={{
                      height: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px 8px 0 0",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#e0e0e0",
                      },
                    }}
                  >
                    {playingId === audio.public_id ? (
                      <PauseIcon sx={{ fontSize: 48, color: "#666" }} />
                    ) : (
                      <PlayArrowIcon sx={{ fontSize: 48, color: "#666" }} />
                    )}
                  </Box>
                  <audio
                    src={audio.secure_url}
                    data-id={audio.public_id}
                    onEnded={() => setPlayingId(null)}
                    style={{ display: 'none' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {audio.name || audio.public_id.split('/').pop()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Uploaded: {new Date(audio.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {audio.public_id}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}

      {viewMode === 'flat' && hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            onClick={() => nextCursor && dispatch(loadMoreAudios(nextCursor))}
            disabled={loadingMore}
            variant="contained"
            startIcon={
              loadingMore ? (
                <CircularProgress size={16} />
              ) : (
                <RefreshIcon />
              )
            }
            sx={{ borderRadius: "8px", boxShadow: "none" }}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </Box>
      )}
    </Box>

   
  );
};

export default Audios;