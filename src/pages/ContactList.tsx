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

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this contact? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(id);
      await deleteContact(id);
      // Remove the deleted contact from the list
      setContacts(contacts.filter((contact) => contact._id !== id));
      setTotalContacts((prev) => prev - 1);
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
                        onClick={() => handleDelete(contact._id)}
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
    </Box>
  );
};

export default ContactList;
