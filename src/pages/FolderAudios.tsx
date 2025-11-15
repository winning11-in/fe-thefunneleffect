import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  ArrowBack as ArrowBackIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import { getAudioFolders } from "../services/api";
import type { AudioFolder } from "../types";

const FolderAudios: React.FC = () => {
  const { folderPath } = useParams<{ folderPath: string }>();
  const navigate = useNavigate();
  const [folder, setFolder] = useState<AudioFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    loadFolderAudios();
  }, [folderPath]);

  useEffect(() => {
    if (playingId) {
      const audio = document.querySelector(`audio[data-id="${playingId}"]`) as HTMLAudioElement;
      if (audio) audio.play();
    } else {
      document.querySelectorAll('audio').forEach(a => a.pause());
    }
  }, [playingId]);

  const loadFolderAudios = async () => {
    if (!folderPath) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getAudioFolders();

      // Find the specific folder
      const foundFolder = result.folders.find(f => f.path === decodeURIComponent(folderPath));

      if (foundFolder) {
        setFolder(foundFolder);
      } else {
        setError("Folder not found");
      }
    } catch (err) {
      console.error("Failed to load folder audios:", err);
      setError("Failed to load folder audios");
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  const handleBreadcrumbClick = (path: string) => {
    if (path === "/audios") {
      navigate("/audios");
    }
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 3 }}>
          
        
        </Box>
        <Grid container spacing={3}>
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
                <CircularProgress sx={{ m: "auto", my: 4 }} />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Loading...
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error || !folder) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/audios")}
          sx={{ mb: 2 }}
        >
          Back to Audios
        </Button>
        <Alert severity="error">
          {error || "Folder not found"}
        </Alert>
      </Box>
    );
  }

  // Create breadcrumb segments from folder path
  const pathSegments = folder.path.split('/').filter(segment => segment);
  const breadcrumbs = [
    { label: "Audios", path: "/audios" },
    ...pathSegments.map((segment, index) => ({
      label: segment,
      path: `/audios/folder/${pathSegments.slice(0, index + 1).join('/')}`
    }))
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/audios")}
          sx={{ mb: 2 }}
          variant="contained"
        >
          Back to Audios
        </Button>

        <Breadcrumbs sx={{ mb: 2 }}>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={crumb.path}
              component="button"
              variant="body1"
              onClick={() => handleBreadcrumbClick(crumb.path)}
              sx={{
                textDecoration: index === breadcrumbs.length - 1 ? 'none' : 'none',
                color: index === breadcrumbs.length - 1 ? 'text.primary' : 'primary.main',
                '&:hover': {
                  textDecoration: index === breadcrumbs.length - 1 ? 'none' : 'underline',
                },
              }}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <FolderIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" component="h1">
              {folder.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {folder.audioCount} audio{folder.audioCount !== 1 ? 's' : ''} • {folder.path}
            </Typography>
          </Box>
        </Box>
      </Box>

      {folder.audios.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <FolderIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No audios in this folder
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {folder.audios.map((audio) => (
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
      )}
    </Box>
  );
};

export default FolderAudios;