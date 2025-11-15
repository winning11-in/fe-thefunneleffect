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
  TextField,
  InputAdornment,
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
  Search as SearchIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchContacts,
  deleteContactById,
  setPagination,
  clearError,
} from "../store/slices/contactsSlice";
import type { Contact } from "../types";
import TableSkeleton from "../components/TableSkeleton";

const ContactList: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: contacts,
    loading,
    error,
    pagination,
  } = useAppSelector((state) => state.contacts);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  useEffect(() => {
    // Fetch contacts when pagination changes or search term changes
    dispatch(
      fetchContacts({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: searchTerm,
      })
    );
  }, [dispatch, pagination.page, pagination.pageSize, searchTerm]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInput(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      setSearchTerm(value);
      // Reset to first page when searching
      dispatch(
        setPagination({
          page: 1,
          pageSize: pagination.pageSize,
        })
      );
    }, 500);
    
    setSearchTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleDelete = (contact: Contact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;

    try {
      await dispatch(deleteContactById(contactToDelete._id));
      setDeleteDialogOpen(false);
      setContactToDelete(null);
      
      // If this was the last item on the current page and we're not on page 1,
      // go back to the previous page
      if (contacts.length === 1 && pagination.page > 1) {
        dispatch(
          setPagination({
            page: pagination.page - 1,
            pageSize: pagination.pageSize,
          })
        );
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const handlePaginationChange = (newPaginationModel: {
    page: number;
    pageSize: number;
  }) => {
    const newPage = newPaginationModel.page + 1; // Convert to 1-based
    const newPageSize = newPaginationModel.pageSize;
    
    // Only dispatch if pagination actually changed
    if (newPage !== pagination.page || newPageSize !== pagination.pageSize) {
      dispatch(
        setPagination({
          page: newPage,
          pageSize: newPageSize,
        })
      );
    }
  };

  const handleRefresh = () => {
    dispatch(
      fetchContacts({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: searchTerm,
      })
    );
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
    <Box>
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
          onClick={handleRefresh}
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

      {/* Search */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          placeholder="Search contacts..."
          value={searchInput}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 300,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
          size="small"
        />
        
        {searchTerm && (
          <Typography variant="body2" color="text.secondary">
            Searching for: "{searchTerm}"
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && contacts.length === 0 && searchTerm && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No contacts found matching "{searchTerm}". Try adjusting your search terms.
        </Alert>
      )}

      {!loading && contacts.length === 0 && !searchTerm && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No contact messages found.
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
          pageSizeOptions={[5, 10, 25, 50]}
          rowCount={pagination.totalItems}
          paginationMode="server"
          loading={loading && contacts.length === 0}
          slots={{
            loadingOverlay: () => <TableSkeleton columns={5} />,
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
