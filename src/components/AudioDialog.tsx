import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Input,
  Skeleton,
  Grid,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Close,
  CloudUpload as CloudUploadIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Folder as FolderIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { uploadAudioToCloudinary, getAudioFolders } from "../services/api";
import type { Audio, AudioFolder } from "../types";

interface AudioDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectAudio: (url: string) => void;
}

const AudioDialog: React.FC<AudioDialogProps> = ({
  open,
  onClose,
  onSelectAudio,
}) => {
  const [audios, setAudios] = useState<Audio[]>([]);
  const [folders, setFolders] = useState<AudioFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentFolderPath, setCurrentFolderPath] = useState<string>("");
  const [viewMode, setViewMode] = useState<'folders' | 'audios'>('folders');

  useEffect(() => {
    if (open) {
      loadFolders();
      // Reset state when dialog opens
      setAudios([]);
      setPlayingId(null);
      setCurrentFolderPath("");
      setViewMode('folders');
    }
  }, [open]);

  useEffect(() => {
    if (playingId) {
      const audio = document.querySelector(`audio[data-id="${playingId}"]`) as HTMLAudioElement;
      if (audio) audio.play();
    } else {
      document.querySelectorAll('audio').forEach(a => a.pause());
    }
  }, [playingId]);

  const loadFolders = async () => {
    setLoadingFolders(true);
    try {
      const result = await getAudioFolders();
      setFolders(result.folders);
    } catch (error) {
      console.error("Failed to load folders:", error);
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleFolderClick = (folder: AudioFolder) => {
    setCurrentFolderPath(folder.path);
    setViewMode('audios');
    // Use the audios from the folder data instead of filtering
    setAudios(folder.audios);
  };

  const handleBreadcrumbClick = (path: string) => {
    if (path === "") {
      // Root level - show folders
      setViewMode('folders');
      setCurrentFolderPath("");
      setAudios([]);
    } else {
      // Navigate to specific folder
      const targetFolder = folders.find(f => f.path === path);
      if (targetFolder) {
        setCurrentFolderPath(path);
        setViewMode('audios');
        setAudios(targetFolder.audios);
      }
    }
  };

  const handleBackToFolders = () => {
    setViewMode('folders');
    setCurrentFolderPath("");
    setAudios([]);
  };

  const handlePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

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
          "modal-audio-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        // Refresh folders data
        loadFolders();
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setUploadLoading(false);
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleAudioSelect = (audioUrl: string) => {
    onSelectAudio(audioUrl);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {viewMode === 'audios' && (
              <IconButton onClick={handleBackToFolders} size="small">
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6">
              {viewMode === 'folders' ? 'Select Audio Folder' :
               currentFolderPath ? `Audios in ${currentFolderPath.split('/').pop()}` :
               'Select Audio'}
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          maxHeight: "70vh",
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          "&::-webkit-scrollbar-thumb:active": {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        {/* Breadcrumbs */}
        {viewMode === 'audios' && currentFolderPath && (
          <Box sx={{ mb: 2 }}>
            <Breadcrumbs>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleBreadcrumbClick("")}
                sx={{ textDecoration: 'underline', color: 'primary.main' }}
              >
                Folders
              </Link>
              {currentFolderPath.split('/').filter(segment => segment).map((segment, index, array) => {
                const path = array.slice(0, index + 1).join('/');
                return (
                  <Link
                    key={path}
                    component="button"
                    variant="body2"
                    onClick={() => handleBreadcrumbClick(path)}
                    sx={{
                      textDecoration: index === array.length - 1 ? 'none' : 'underline',
                      color: index === array.length - 1 ? 'text.primary' : 'primary.main'
                    }}
                  >
                    {segment}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>
        )}

        {viewMode === 'folders' ? (
          // Folder view
          loadingFolders ? (
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          ) : folders.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
              No folders found.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {folders.map((folder) => (
                <Grid item xs={12} sm={6} md={4} key={folder.path}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        boxShadow: 2,
                        borderColor: "primary.main",
                      },
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                    }}
                    onClick={() => handleFolderClick(folder)}
                  >
                    <CardContent sx={{ textAlign: "center", py: 2 }}>
                      <FolderIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {folder.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {folder.audioCount} audio{folder.audioCount !== 1 ? 's' : ''}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )
        ) : (
          // Audio view
          <Box>
            {audios.map((audio) => (
              <Box
                key={audio.public_id}
                onClick={() => handleAudioSelect(audio.secure_url)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  borderBottom: "1px solid #e0e0e0",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlay(audio.public_id);
                  }}
                  size="small"
                  sx={{ mr: 2 }}
                >
                  {playingId === audio.public_id ? (
                    <PauseIcon />
                  ) : (
                    <PlayArrowIcon />
                  )}
                </IconButton>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {audio.name || audio.public_id.split('/').pop()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(audio.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <audio
                  src={audio.secure_url}
                  data-id={audio.public_id}
                  onEnded={() => setPlayingId(null)}
                  style={{ display: 'none' }}
                />
              </Box>
            ))}
          </Box>
        )}

        {viewMode === 'audios' && audios.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No audios found in this folder.
            </Typography>
            <Button
              onClick={handleBackToFolders}
              startIcon={<ArrowBackIcon />}
              sx={{ mt: 2 }}
            >
              Back to Folders
            </Button>
          </Box>
        )}
      </DialogContent>      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          gap: 2,
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <Input
          type="file"
          inputProps={{ accept: "audio/*" }}
          id="modal-audio-upload"
          onChange={handleFileSelect}
          sx={{ display: "none" }}
        />
        <Button
          variant="outlined"
          component="label"
          htmlFor="modal-audio-upload"
          startIcon={
            uploadLoading ? <CircularProgress size={16} /> : <CloudUploadIcon />
          }
          sx={{ borderRadius: "8px" }}
        >
          {uploadLoading ? "Uploading..." : "Upload New Audio"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default AudioDialog;