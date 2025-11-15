import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Input,
  Skeleton,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchImages,
  loadMoreImages,
  deleteImage,
} from "../store/slices/imagesSlice";
import { uploadToCloudinary } from "../services/api";

const Images: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: images,
    loading,
    loadingMore,
    error,
    lastFetched,
    hasMore,
    nextCursor,
  } = useAppSelector((state) => state.images);

  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    const CACHE_DURATION = 5 * 60 * 1000;
    const shouldFetch =
      !lastFetched || Date.now() - lastFetched > CACHE_DURATION;

    if (shouldFetch) {
      dispatch(fetchImages());
    }
  }, [dispatch, lastFetched]);

  const handleDeleteImage = (publicId: string) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      dispatch(deleteImage(publicId));
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadLoading(true);
      try {
        await uploadToCloudinary(file);
        // Reset file input
        const fileInput = document.getElementById(
          "image-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        // Refresh images list
        dispatch(fetchImages());
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setUploadLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h6" component="h1" gutterBottom>
            Uploaded Images
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
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" component="h1" gutterBottom>
          Uploaded Images
        </Typography>

        <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <Input
            type="file"
            inputProps={{ accept: "image/*" }}
            id="image-upload"
            onChange={handleFileSelect}
            sx={{ display: "none" }}
          />
          <Button
            variant="contained"
            component="label"
            htmlFor="image-upload"
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
            {uploadLoading ? "Uploading..." : "Upload Image"}
          </Button>
        </Box>
      </Box>

      {images.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No images uploaded yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {images.map((image) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={image.public_id}>
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
                <IconButton
                  onClick={() => handleDeleteImage(image.public_id)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    },
                    display: "none", // Hidden for now
                  }}
                  size="small"
                >
                  <DeleteIcon color="error" />
                </IconButton>
                <CardMedia
                  component="img"
                  height="200"
                  image={image.secure_url}
                  alt={`Uploaded image ${image.public_id}`}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded: {new Date(image.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {image.public_id}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {hasMore && (
        <IconButton
          onClick={() => nextCursor && dispatch(loadMoreImages(nextCursor))}
          disabled={loadingMore}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            backgroundColor: "primary.main",
            color: "white",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            boxShadow: 3,
            zIndex: 1000,
          }}
          size="large"
        >
          {loadingMore ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <RefreshIcon />
          )}
        </IconButton>
      )}
    </Box>
  );
};

export default Images;
