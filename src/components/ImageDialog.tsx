import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardActionArea,
  CircularProgress,
  IconButton,
  Input,
  Skeleton,
} from "@mui/material";
import { Close, CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { getUploadedImages, uploadToCloudinary } from "../services/api";

interface ImageDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
}

interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  created_at: string;
}

const ImageDialog: React.FC<ImageDialogProps> = ({
  open,
  onClose,
  onSelectImage,
}) => {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadImages(true);
    } else {
      // Reset state when dialog closes
      setImages([]);
      setNextCursor(undefined);
      setHasMore(false);
    }
  }, [open]);

  const loadImages = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setImages([]);
      setNextCursor(undefined);
    } else {
      setLoadingMore(true);
    }

    try {
      const result = await getUploadedImages({
        limit: 10,
        nextCursor: reset ? undefined : nextCursor,
      });

      if (reset) {
        setImages(result.images);
      } else {
        setImages((prev) => [...prev, ...result.images]);
      }

      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load images:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    onSelectImage(imageUrl);
    onClose();
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
          "modal-image-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        // Refresh images list
        loadImages(true);
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Select Image</Typography>
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
        {loading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Skeleton
                  variant="rectangular"
                  height={120}
                  sx={{ borderRadius: 1 }}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2}>
            {images.map((image) => (
              <Grid item xs={6} sm={4} md={3} key={image.public_id}>
                <Card>
                  <CardActionArea
                    onClick={() => handleImageSelect(image.secure_url)}
                  >
                    <CardMedia
                      component="img"
                      height="120"
                      image={image.secure_url}
                      alt="Uploaded image"
                      sx={{ objectFit: "cover" }}
                    />
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {images.length === 0 && !loading && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            No images uploaded yet.
          </Typography>
        )}
      </DialogContent>

      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Input
          type="file"
          inputProps={{ accept: "image/*" }}
          id="modal-image-upload"
          onChange={handleFileSelect}
          sx={{ display: "none" }}
        />
        <Button
          variant="outlined"
          component="label"
          htmlFor="modal-image-upload"
          startIcon={
            uploadLoading ? <CircularProgress size={16} /> : <CloudUploadIcon />
          }
          sx={{ borderRadius: "8px" }}
        >
          {uploadLoading ? "Uploading..." : "Upload New Image"}
        </Button>

        {hasMore && (
          <Button
            variant="contained"
            onClick={() => loadImages(false)}
            disabled={loadingMore}
            sx={{ borderRadius: "8px" }}
          >
            {loadingMore ? "Loading..." : "Load More Images"}
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default ImageDialog;
