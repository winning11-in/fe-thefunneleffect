import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid";
import {
  Plus as AddIcon,
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Search as SearchIcon,
  Eye as VisibilityIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchPages,
  deletePage,
  setPagination,
  setGroupFilter,
} from "../store/slices/pagesSlice";
import type { Page } from "../types";
import TableSkeleton from "../components/TableSkeleton";

// Group options for filtering
const GROUP_OPTIONS = [
  { value: "", label: "All Groups" },
  { value: "blogs", label: "Blogs" },
  { value: "cardiology", label: "Cardiology" },
  { value: "case-studies", label: "Case Studies" },
];

const PageList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    items: pages,
    loading,
    error,
    pagination,
  } = useAppSelector((state) => state.pages);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [pageToDelete, setPageToDelete] = React.useState<Page | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchInput, setSearchInput] = React.useState(""); // Local input state
  const [searchTimeout, setSearchTimeout] = React.useState<NodeJS.Timeout | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = React.useState(""); // Local group filter state

  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string>("");

  useEffect(() => {
    // Fetch pages when pagination changes, search term changes, or group filter changes
    dispatch(
      fetchPages({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: searchTerm,
        group: selectedGroupFilter,
      })
    );
  }, [dispatch, pagination.page, pagination.pageSize, searchTerm, selectedGroupFilter]);

  const handleEdit = (id: string) => {
    navigate(`/pages/edit/${id}`);
  };

  const handleDelete = (page: Page) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pageToDelete) return;

    try {
      await dispatch(deletePage(pageToDelete._id));
      setDeleteDialogOpen(false);
      setPageToDelete(null);
      
      // If this was the last item on the current page and we're not on page 1,
      // go back to the previous page
      if (pages.length === 1 && pagination.page > 1) {
        dispatch(
          setPagination({
            page: pagination.page - 1,
            pageSize: pagination.pageSize,
          })
        );
      }
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInput(value); // Update local input immediately
    
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

  const handleGroupFilterChange = (event: any) => {
    const value = event.target.value;
    setSelectedGroupFilter(value);
    dispatch(setGroupFilter(value));
    // Reset to first page when filtering
    dispatch(
      setPagination({
        page: 1,
        pageSize: pagination.pageSize,
      })
    );
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

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

  const handlePreview = (page: Page) => {
    // Navigate to preview page
    navigate(`/pages/preview/${page.slug}`);
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "slug",
      headerName: "Slug",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "imageUrl",
      headerName: "Image",
      width: 100,
      renderCell: (params) => (
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <img
            src={params.value}
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
            onClick={() => {
              setSelectedImage(params.value);
              setImageDialogOpen(true);
            }}
          >
            <VisibilityIcon size={20} color="white" />
          </Box>
        </Box>
      ),
    },

    {
      field: "groups",
      headerName: "Groups",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {params.value.slice(0, 2).map((group: string, index: number) => (
            <Chip key={index} label={group} size="small" />
          ))}
          {params.value.length > 2 && (
            <Chip
              label={`+${params.value.length - 2}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      ),
    },
    {
      field: "popular",
      headerName: "Popular",
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Yes" : "No"}
          color={params.value ? "primary" : "default"}
          size="small"
          variant={params.value ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "category",
      headerName: "Category",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || "-"}
        </Typography>
      ),
    },
    {
      field: "readTime",
      headerName: "Read Time",
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? `${params.value} min` : "-"}
        </Typography>
      ),
    },
    {
      field: "tags",
      headerName: "Tags",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {params.value.slice(0, 2).map((tag: string, index: number) => (
            <Chip key={index} label={tag} size="small" color="secondary" />
          ))}
          {params.value.length > 2 && (
            <Chip
              label={`+${params.value.length - 2}`}
              size="small"
              variant="outlined"
              color="secondary"
            />
          )}
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params: GridRowParams<Page>) => [
        <GridActionsCellItem
          key="preview"
          icon={
            <Tooltip title="Preview">
              <VisibilityIcon size={20} />
            </Tooltip>
          }
          label="Preview"
          onClick={() => handlePreview(params.row)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title="Edit">
              <EditIcon size={18} />
            </Tooltip>
          }
          label="Edit"
          onClick={() => handleEdit(params.row._id)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title="Delete">
              <DeleteIcon size={18} />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDelete(params.row)}
        />,
      ],
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" component="h1">
          Pages
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon size={20} />}
          onClick={() => navigate("/pages/new")}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            py: 1,
          }}
        >
          Create New Page
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          placeholder="Search pages..."
          value={searchInput}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon size={20} />
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

        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Filter by Group</InputLabel>
          <Select
            value={selectedGroupFilter}
            onChange={handleGroupFilterChange}
            label="Filter by Group"
            sx={{
              borderRadius: "8px",
            }}
          >
            {GROUP_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {searchTerm && (
          <Typography variant="body2" color="text.secondary">
            Searching for: "{searchTerm}"
          </Typography>
        )}

        {selectedGroupFilter && (
          <Typography variant="body2" color="text.secondary">
            Filtered by: {GROUP_OPTIONS.find(option => option.value === selectedGroupFilter)?.label}
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && pages.length === 0 && searchTerm && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No pages found matching "{searchTerm}". Try adjusting your search terms.
        </Alert>
      )}

      {!loading && pages.length === 0 && !searchTerm && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No pages found. Create your first page to get started.
        </Alert>
      )}

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={pages}
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
          loading={loading}
          slots={{
            loadingOverlay: () => <TableSkeleton columns={10} />,
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Page</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the page "{pageToDelete?.title}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
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
      {/* Image Preview Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
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
    </Box>
  );
};

export default PageList;
