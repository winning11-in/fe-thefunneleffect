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
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchPlaylists,
  deletePlaylist,
  setPagination,
  setSearchTerm,
  setCreatedByFilter,
  setIsPublicFilter,
} from "../store/slices/playlistsSlice";
import type { Playlist } from "../types";
import TableSkeleton from "../components/TableSkeleton";

const PlaylistList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    items: playlists,
    loading,
    error,
    pagination,
    searchTerm,
    createdByFilter,
    isPublicFilter,
    tagFilter,
    lastFetched,
    lastFetchParams,
  } = useAppSelector((state) => state.playlists);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [playlistToDelete, setPlaylistToDelete] = React.useState<Playlist | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = React.useState(searchTerm);

  // Sync local search term with Redux state
  React.useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Client-side filtering
  const filteredPlaylists = useMemo(() => {
    return playlists.filter((playlist) => {
      const matchesSearch =
        searchTerm === "" ||
        (playlist.title && playlist.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (playlist.description && playlist.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCreatedBy =
        createdByFilter === "" ||
        (playlist.createdBy && playlist.createdBy.toLowerCase().includes(createdByFilter.toLowerCase()));
      const matchesPublic =
        isPublicFilter === "" ||
        (isPublicFilter === 'true' ? playlist.isPublic : !playlist.isPublic);
      return matchesSearch && matchesCreatedBy && matchesPublic;
    });
  }, [playlists, searchTerm, createdByFilter, isPublicFilter]);

  useEffect(() => {
    // Only fetch if we haven't fetched recently or if pagination/filters changed
    const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for playlists list
    const currentParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchTerm,
      createdBy: createdByFilter,
      isPublic: isPublicFilter ? isPublicFilter === 'true' : undefined,
      tag: tagFilter,
    };

    const paramsChanged = !lastFetchParams ||
      currentParams.page !== lastFetchParams.page ||
      currentParams.pageSize !== lastFetchParams.pageSize ||
      currentParams.search !== lastFetchParams.search ||
      currentParams.createdBy !== lastFetchParams.createdBy ||
      currentParams.isPublic !== lastFetchParams.isPublic ||
      currentParams.tag !== lastFetchParams.tag;

    const shouldFetch = !lastFetched || Date.now() - lastFetched > CACHE_DURATION || paramsChanged;

    if (shouldFetch) {
      dispatch(
        fetchPlaylists({
          page: pagination.page,
          pageSize: pagination.pageSize,
          search: searchTerm,
          createdBy: createdByFilter,
          isPublic: isPublicFilter ? isPublicFilter === 'true' : undefined,
          tag: tagFilter,
        })
      );
    }
  }, [dispatch, pagination.page, pagination.pageSize, searchTerm, createdByFilter, isPublicFilter, tagFilter, lastFetched, lastFetchParams]);

  const handleSearch = () => {
    dispatch(setSearchTerm(localSearchTerm));
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDeleteClick = (playlist: Playlist) => {
    setPlaylistToDelete(playlist);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (playlistToDelete) {
      await dispatch(deletePlaylist(playlistToDelete._id));
      setDeleteDialogOpen(false);
      setPlaylistToDelete(null);
    }
  };

  const handlePaginationChange = (newPagination: { page: number; pageSize: number }) => {
    dispatch(setPagination(newPagination));
  };

  const handleCreatedByFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setCreatedByFilter(event.target.value));
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }));
  };

  const handleIsPublicFilterChange = (event: SelectChangeEvent) => {
    dispatch(setIsPublicFilter(event.target.value));
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }));
  };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Tooltip title={params.value || 'No title'}>
          <Typography variant="body2" noWrap>
            {params.value || 'Untitled'}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Tooltip title={params.value || 'No description'}>
          <Typography variant="body2" noWrap>
            {params.value || 'No description'}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value || 'Unknown'}
        </Typography>
      ),
    },
    {
      field: 'trackCount',
      headerName: 'Tracks',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 0}
        </Typography>
      ),
    },
    {
      field: 'duration',
      headerName: 'Duration',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'isPublic',
      headerName: 'Public',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Public' : 'Private'}
          size="small"
          color={params.value ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="view"
          icon={
            <Tooltip title="View">
              <VisibilityIcon size={20} />
            </Tooltip>
          }
          label="View"
          onClick={() => navigate(`/playlists/${params.id}`)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title="Edit">
              <EditIcon size={18} />
            </Tooltip>
          }
          label="Edit"
          onClick={() => navigate(`/playlists/${params.id}/edit`)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title="Delete">
              <DeleteIcon size={18} />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDeleteClick(params.row)}
        />,
      ],
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h1">
          Playlists
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon size={20} />}
          onClick={() => navigate('/playlists/new')}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            py: 1,
          }}
        >
          Add Playlist
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search playlists..."
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
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

        <TextField
          placeholder="Filter by creator..."
          value={createdByFilter}
          onChange={handleCreatedByFilterChange}
          size="small"
          sx={{
            minWidth: 200,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={isPublicFilter}
            onChange={handleIsPublicFilterChange}
            displayEmpty
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          >
            <MenuItem value="">
              All Playlists
            </MenuItem>
            <MenuItem value="true">Public</MenuItem>
            <MenuItem value="false">Private</MenuItem>
          </Select>
        </FormControl>

        <Button 
          variant="outlined" 
          onClick={handleSearch}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Search
        </Button>
      </Box>

      {/* Data Grid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={loading ? [] : filteredPlaylists}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          paginationMode="server"
          rowCount={pagination.totalItems}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={{
            page: pagination.page - 1,
            pageSize: pagination.pageSize,
          }}
          onPaginationModelChange={(model) =>
            handlePaginationChange({
              page: model.page + 1,
              pageSize: model.pageSize,
            })
          }
          slots={{
            loadingOverlay: () => <TableSkeleton columns={8} />,
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
        <DialogTitle>Delete Playlist</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{playlistToDelete?.title || 'this playlist'}"?
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
            onClick={handleDeleteConfirm} 
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

export default PlaylistList;