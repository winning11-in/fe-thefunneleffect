import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid";
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { getContacts, deleteContact } from "../services/api";
import type { Contact, ContactPaginatedResponse } from "../types";
import TableSkeleton from "../components/TableSkeleton";

const ContactList: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
  });
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  const fetchContacts = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response: ContactPaginatedResponse = await getContacts(page, pageSize);
      setContacts(response.data);
      setPagination({
        page: response.page,
        pageSize: pageSize,
        totalItems: response.total,
      });
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setError("Failed to load contacts");
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
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;

    try {
      await deleteContact(contactToDelete._id);
      // Remove the deleted contact from the list
      setContacts(contacts.filter((c) => c._id !== contactToDelete._id));
      setPagination(prev => ({
        ...prev,
        totalItems: prev.totalItems - 1,
      }));
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    } catch (err) {
      console.error("Failed to delete contact:", err);
      setError("Failed to delete contact");
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  const handlePaginationChange = (newPaginationModel: {
    page: number;
    pageSize: number;
  }) => {
    setPagination(prev => ({
      ...prev,
      page: newPaginationModel.page + 1, // Convert to 1-based
      pageSize: newPaginationModel.pageSize,
    }));
    fetchContacts(newPaginationModel.page + 1, newPaginationModel.pageSize);
  };

  const handleViewDescription = (description: string) => {
    setSelectedDescription(description);
    setDescriptionDialogOpen(true);
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

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Contact Info",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            {params.row.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {params.row.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: "mobile",
      headerName: "Mobile",
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ maxWidth: 200 }}>
          <Typography variant="body2" noWrap>
            {truncateText(params.value, 50)}
          </Typography>
          {params.value.length > 50 && (
            <Button
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => handleViewDescription(params.value)}
              sx={{ mt: 0.5, minHeight: 'auto', py: 0.5 }}
            >
              View Full
            </Button>
          )}
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Date",
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params: GridRowParams<Contact>) => [
        <GridActionsCellItem
          key="view"
          icon={
            <Tooltip title="View Description">
              <VisibilityIcon />
            </Tooltip>
          }
          label="View Description"
          onClick={() => handleViewDescription(params.row.description)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title="Delete Contact">
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDelete(params.row)}
        />,
      ],
    },
  ];

  if (loading && contacts.length === 0) {
    return (
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={[]}
          columns={columns}
          loading={true}
          slots={{
            loadingOverlay: () => <TableSkeleton columns={4} />,
          }}
        />
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
          <Typography variant="h6" component="h1">
            Contact Messages
          </Typography>
         
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => fetchContacts(pagination.page, pagination.pageSize)}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            py: 1,
          }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={contacts}
          columns={columns}
          getRowId={(row) => row._id}
          paginationModel={{
            page: pagination.page - 1, // Convert to 0-based for DataGrid
            pageSize: pagination.pageSize,
          }}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[5, 10, 25]}
          rowCount={pagination.totalItems}
          paginationMode="server"
          loading={loading}
          slots={{
            loadingOverlay: () => <TableSkeleton columns={4} />,
          }}
          disableRowSelectionOnClick
          sx={{
            "& .MuiDataGrid-cell": {
              border: "none",
              "&:focus": {
                outline: "none",
              },
              "&:focus-within": {
                outline: "none",
              },
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "grey.50",
              border: "none",
            },
            "& .MuiDataGrid-row": {
              borderBottom: "1px solid #e0e0e0",
            },
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
          }}
        />
      </Box>

      {/* Description Dialog */}
      <Dialog
        open={descriptionDialogOpen}
        onClose={() => setDescriptionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Contact Description</DialogTitle>
        <DialogContent>
          <DialogContentText>{selectedDescription}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDescriptionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the contact "{contactToDelete?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setContactToDelete(null);
            }}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactList;
