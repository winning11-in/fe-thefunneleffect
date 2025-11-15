import React, { useState, useEffect } from "react";
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
  TextField,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { getContacts, deleteContact } from "../services/api";
import type { Contact, ContactPaginatedResponse } from "../types";

const ContactList: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [selectedDescription, setSelectedDescription] = useState<string>("");
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const fetchContacts = async (page = 1) => {
    try {
      setLoading(true);
      const response: ContactPaginatedResponse = await getContacts(page, 10);
      setContacts(response.data);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setTotalContacts(response.total);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = (contact: Contact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
    setDeleteConfirmationText("");
  };

  const confirmDelete = async () => {
    if (!contactToDelete || deleteConfirmationText !== "DELETE") return;

    try {
      setDeleting(contactToDelete._id);
      await deleteContact(contactToDelete._id);
      // Remove the deleted contact from the list
      setContacts(contacts.filter((contact) => contact._id !== contactToDelete._id));
      setTotalContacts((prev) => prev - 1);
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    } catch (error) {
      console.error("Failed to delete contact:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    fetchContacts(page);
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
    <Box  >
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
            Contact Messages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalContacts} total contact{totalContacts !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => fetchContacts(currentPage)}
        >
          Refresh
        </Button>
      </Box>

      {/* Contact List */}
      {contacts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No contacts found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contact messages will appear here when submitted.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contact Info</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact._id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {contact.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contact.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{contact.mobile}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" noWrap>
                        {truncateText(contact.description, 50)}
                      </Typography>
                      {contact.description.length > 50 && (
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() =>
                            handleViewDescription(contact.description)
                          }
                        >
                          View Full
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(contact.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete Contact">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(contact)}
                        disabled={deleting === contact._id}
                      >
                        {deleting === contact._id ? (
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
        <DialogTitle>Contact Description</DialogTitle>
        <DialogContent>
          <DialogContentText>{selectedDescription}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDescriptionDialog(false)}>Close</Button>
        </DialogActions>
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
          🗑️ Delete Contact
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
              Are you sure you want to delete this contact?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontStyle: 'italic',
              }}
            >
              "{contactToDelete?.name}"
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
              ⚠️ This action cannot be undone. The contact will be permanently removed.
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
              setContactToDelete(null);
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
            disabled={deleteConfirmationText !== 'DELETE' || deleting === contactToDelete?._id}
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
            {deleting === contactToDelete?._id ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Delete Contact'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactList;
