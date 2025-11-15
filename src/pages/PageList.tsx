import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Pagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Chip,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { pagesAPI } from "../services/api";
import type { Page, PaginatedResponse } from "../types";

const PageList: React.FC = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPagesCount, setTotalPagesCount] = useState(0);
  const [selectedDescription, setSelectedDescription] = useState<string>("");
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const fetchPages = async (page = 1) => {
    try {
      setLoading(true);
      const response: PaginatedResponse<Page> = await pagesAPI.getAll({ page, limit: 10 });
      setPages(response.data.pages);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalPagesCount(response.data.pagination.totalItems);
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = (page: Page) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
    setDeleteConfirmationText("");
  };

  const confirmDelete = async () => {
    if (!pageToDelete || deleteConfirmationText !== "DELETE") return;

    try {
      setDeleting(pageToDelete._id);
      await pagesAPI.delete(pageToDelete._id);
      // Remove the deleted page from the list
      setPages(pages.filter((page) => page._id !== pageToDelete._id));
      setTotalPagesCount((prev) => prev - 1);
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    } catch (error) {
      console.error("Failed to delete page:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    fetchPages(page);
    console.log("event", event);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleViewDescription = (description: string) => {
    setSelectedDescription(description);
    setShowDescriptionDialog(true);
  };

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageDialog(true);
  };

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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Pages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalPagesCount} total page{totalPagesCount !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => fetchPages(currentPage)}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/pages/new")}
          >
            Create New Page
          </Button>
        </Box>
      </Box>

      {/* Pages List */}
      {pages.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No pages found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pages will appear here when created.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title & Description</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Groups</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page._id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {page.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {truncateText(page.description, 50)}
                      </Typography>
                      {page.description.length > 50 && (
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() =>
                            handleViewDescription(page.description)
                          }
                        >
                          View Full
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{page.slug}</Typography>
                  </TableCell>
                  <TableCell>
                    {page.imageUrl && (
                      <Box sx={{ position: "relative", display: "inline-block" }}>
                        <img
                          src={page.imageUrl}
                          alt="Page Image"
                          style={{ width: 50, height: 50, objectFit: "cover" }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(0,0,0,0.5)",
                            opacity: 0,
                            transition: "opacity 0.3s",
                            "&:hover": { opacity: 1 },
                            cursor: "pointer",
                          }}
                          onClick={() => handleViewImage(page.imageUrl)}
                        >
                          <VisibilityIcon sx={{ color: "white", fontSize: 20 }} />
                        </Box>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {page.groups.slice(0, 2).map((group, index) => (
                        <Chip key={index} label={group} size="small" />
                      ))}
                      {page.groups.length > 2 && (
                        <Chip
                          label={`+${page.groups.length - 2}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(page.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Preview">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/pages/preview/${page.slug}`)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/pages/edit/${page._id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Page">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(page)}
                        disabled={deleting === page._id}
                      >
                        {deleting === page._id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Description Dialog */}
      <Dialog
        open={showDescriptionDialog}
        onClose={() => setShowDescriptionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Page Description</DialogTitle>
        <DialogContent>
          <DialogContentText>{selectedDescription}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDescriptionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Image Dialog */}
      <Dialog
        open={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        maxWidth="md"
      >
        <DialogContent>
          <img
            src={selectedImage}
            alt="Full Image"
            style={{ width: "100%", height: "auto" }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            pb: 1,
            pt: 3,
            fontWeight: 600,
            fontSize: '1.25rem',
            color: 'error.main',
          }}
        >
          🗑️ Delete Page
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="body1"
              sx={{
                color: 'text.primary',
                fontWeight: 500,
                mb: 1,
              }}
            >
              Are you sure you want to delete this page?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontStyle: 'italic',
              }}
            >
              "{pageToDelete?.title}"
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: 'error.light',
              borderRadius: 2,
              p: 2,
              mb: 3,
              border: '1px solid',
              borderColor: 'error.main',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'error.contrastText',
                fontWeight: 500,
                textAlign: 'center',
              }}
            >
              ⚠️ This action cannot be undone. The page will be permanently removed.
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              mb: 2,
              color: 'text.secondary',
              textAlign: 'center',
            }}
          >
            To confirm deletion, please type <strong style={{ color: 'error.main' }}>DELETE</strong> below:
          </Typography>

          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            placeholder="Type DELETE to confirm"
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'grey.50',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
                '&.Mui-focused': {
                  bgcolor: 'background.paper',
                },
              },
            }}
            inputProps={{
              style: { textAlign: 'center', fontWeight: 500 },
            }}
          />

          {deleteConfirmationText && deleteConfirmationText !== 'DELETE' && (
            <Typography
              variant="caption"
              sx={{
                color: 'error.main',
                textAlign: 'center',
                mt: 1,
                display: 'block',
              }}
            >
              Please type "DELETE" exactly to confirm
            </Typography>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 0,
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setPageToDelete(null);
              setDeleteConfirmationText('');
            }}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteConfirmationText !== 'DELETE' || deleting === pageToDelete?._id}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 500,
              minWidth: 100,
              '&:disabled': {
                bgcolor: 'grey.300',
                color: 'grey.500',
              },
            }}
          >
            {deleting === pageToDelete?._id ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Delete Page'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PageList;
