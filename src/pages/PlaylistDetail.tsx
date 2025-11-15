import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Grid,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
} from "@mui/icons-material";
import { playlistsAPI } from "../services/api";
import type { Playlist, Track } from "../types";

const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await playlistsAPI.getById(id);
        setPlaylist(response.data);
      } catch (err) {
        console.error("Error fetching playlist:", err);
        setError("Failed to load playlist");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  const handlePlayTrack = (trackIndex: number) => {
    if (currentTrackIndex === trackIndex && isPlaying) {
      // Pause current track
      if (audioElement) {
        audioElement.pause();
        setIsPlaying(false);
      }
    } else {
      // Play new track or resume
      if (audioElement) {
        audioElement.pause();
      }

      if (playlist && playlist.tracks[trackIndex]?.audioUrl) {
        const audio = new Audio(playlist.tracks[trackIndex].audioUrl);
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          // Auto-play next track
          if (trackIndex < playlist.tracks.length - 1) {
            handlePlayTrack(trackIndex + 1);
          }
        });
        audio.play();
        setAudioElement(audio);
        setCurrentTrackIndex(trackIndex);
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !playlist) {
    return (
      <Box >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Playlist not found"}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/playlists")}
          variant="outlined"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Back to Playlists
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/playlists")}
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 500,
        }}
      >
        Back to Playlists
      </Button>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4}>
            {playlist.thumbnail && (
              <Box
                component="img"
                src={playlist.thumbnail}
                alt={playlist.title}
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  height: 'auto',
                  borderRadius: 2,
                }}
              />
            )}
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {playlist.title || 'Untitled Playlist'}
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              {playlist.description || 'No description'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`${playlist.trackCount} tracks`}
                variant="outlined"
              />
              {playlist.duration && (
                <Chip
                  label={`Duration: ${playlist.duration}`}
                  variant="outlined"
                />
              )}
              <Chip
                label={playlist.isPublic ? 'Public' : 'Private'}
                color={playlist.isPublic ? 'success' : 'default'}
                variant="outlined"
              />
            </Box>
            {playlist.createdBy && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Created by: {playlist.createdBy}
              </Typography>
            )}
            {playlist.tags && playlist.tags.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {playlist.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Tracks List */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Tracks ({playlist.tracks.length})
      </Typography>
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <List>
          {playlist.tracks.map((track: Track, index: number) => (
            <ListItem
              key={track._id}
              sx={{
                '&:hover': {
                  backgroundColor: 'none',
                },
                borderBottom: index < playlist.tracks.length - 1 ? '1px solid' : 'none',
                borderBottomColor: 'divider',
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={track.thumbnail}
                  variant="rounded"
                  sx={{ width: 60, height: 60 }}
                >
                  {track.title?.charAt(0) || 'T'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="h6" sx={{ fontWeight: 400 ,fontSize: '16px'}}>
                    {track.title || 'Untitled'}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" component="span" color="text.secondary">
                      {track.author || 'Unknown Artist'}
                    </Typography>
                    {track.duration && (
                      <>
                        <Typography variant="body2" component="span" sx={{ mx: 1 }}>•</Typography>
                        <Typography variant="body2" component="span" color="text.secondary">
                          {track.duration}
                        </Typography>
                      </>
                    )}
                  </Box>
                }
                sx={{marginLeft:"15px"}}
              />
              <IconButton
                onClick={() => handlePlayTrack(index)}
                color={currentTrackIndex === index && isPlaying ? "primary" : "default"}
                size="large"
              >
                {currentTrackIndex === index && isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default PlaylistDetail;