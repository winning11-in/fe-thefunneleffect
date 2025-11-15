import React, { useEffect, useMemo } from "react";
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
  SelectChangeEvent,
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
} from "../store/slices/pagesSlice";
import type { Page } from "../types";
import TableSkeleton from "../components/TableSkeleton";

const PageList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    items: pages,
    loading,
    error,
    pagination,
    lastFetched,
  } = useAppSelector((state) => state.pages);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [pageToDelete, setPageToDelete] = React.useState<Page | null>(null);
  const [titleFilter, setTitleFilter] = React.useState("");
  const [selectedGroups, setSelectedGroups] = React.useState<string[]>([]);

  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string>("");

  // Get unique groups for filter dropdown
  const availableGroups = useMemo(() => {
    const groups = new Set<string>();
    pages.forEach((page) => page.groups.forEach((group) => groups.add(group)));
    return Array.from(groups).sort();
  }, [pages]);

  // Client-side filtering
  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchesTitle =
        titleFilter === "" ||
        page.title.toLowerCase().includes(titleFilter.toLowerCase());
      const matchesGroups =
        selectedGroups.length === 0 ||
        selectedGroups.some((group) => page.groups.includes(group));
      return matchesTitle && matchesGroups;
    });
  }, [pages, titleFilter, selectedGroups]);

  useEffect(() => {
    // Only fetch if we haven't fetched recently or if pagination changed
    const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for pages list
    const shouldFetch =
      !lastFetched || Date.now() - lastFetched > CACHE_DURATION;

    if (shouldFetch || pagination.page !== 1 || pagination.pageSize !== 10) {
      dispatch(
        fetchPages({
          page: pagination.page,
          pageSize: pagination.pageSize,
        })
      );
    }
  }, [dispatch, pagination.page, pagination.pageSize, lastFetched]);

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
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  };

  const handleTitleFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTitleFilter(event.target.value);
  };

  const handleGroupsFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedGroups(value);
  };

  const handlePaginationChange = (newPaginationModel: {
    page: number;
    pageSize: number;
  }) => {
    dispatch(
      setPagination({
        page: newPaginationModel.page + 1, // Convert to 1-based
        pageSize: newPaginationModel.pageSize,
      })
    );
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
      width: 200,
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
          placeholder="Search by title..."
          value={titleFilter}
          onChange={handleTitleFilterChange}
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

        <FormControl sx={{ minWidth: 200 }}>
          <Select
            multiple
            value={selectedGroups}
            onChange={handleGroupsFilterChange}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
            size="small"
          >
            {availableGroups.map((group) => (
              <MenuItem key={group} value={group}>
                {group}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={loading ? [] : filteredPages}
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
            loadingOverlay: () => <TableSkeleton columns={6} />,
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
