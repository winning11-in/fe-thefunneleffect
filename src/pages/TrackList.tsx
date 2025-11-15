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
  fetchTracks,
  deleteTrack,
  setPagination,
  setSearchTerm,
  setCategoryFilter,
  setAuthorFilter,
} from "../store/slices/tracksSlice";
import type { Track } from "../types";
import TableSkeleton from "../components/TableSkeleton";

const TrackList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    items: tracks,
    loading,
    error,
    pagination,
    searchTerm,
    categoryFilter,
    authorFilter,
    lastFetched,
    lastFetchParams,
  } = useAppSelector((state) => state.tracks);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [trackToDelete, setTrackToDelete] = React.useState<Track | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = React.useState(searchTerm);

  // Sync local search term with Redux state
  React.useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Client-side filtering
  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      const matchesSearch =
        searchTerm === "" ||
        (track.title && track.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (track.author && track.author.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        categoryFilter === "" ||
        track.category === categoryFilter;
      const matchesAuthor =
        authorFilter === "" ||
        (track.author && track.author.toLowerCase().includes(authorFilter.toLowerCase()));
      return matchesSearch && matchesCategory && matchesAuthor;
    });
  }, [tracks, searchTerm, categoryFilter, authorFilter]);

  useEffect(() => {
    // Only fetch if we haven't fetched recently or if pagination/filters changed
    const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for tracks list
    const currentParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchTerm,
      category: categoryFilter,
      author: authorFilter,
    };

    const paramsChanged = !lastFetchParams ||
      currentParams.page !== lastFetchParams.page ||
      currentParams.pageSize !== lastFetchParams.pageSize ||
      currentParams.search !== lastFetchParams.search ||
      currentParams.category !== lastFetchParams.category ||
      currentParams.author !== lastFetchParams.author;

    const shouldFetch = !lastFetched || Date.now() - lastFetched > CACHE_DURATION || paramsChanged;

    if (shouldFetch) {
      dispatch(
        fetchTracks({
          page: pagination.page,
          pageSize: pagination.pageSize,
          search: searchTerm,
          category: categoryFilter,
          author: authorFilter,
        })
      );
    }
  }, [dispatch, pagination.page, pagination.pageSize, searchTerm, categoryFilter, authorFilter, lastFetched, lastFetchParams]);

  const handleSearch = () => {
    dispatch(setSearchTerm(localSearchTerm));
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDeleteClick = (track: Track) => {
    setTrackToDelete(track);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (trackToDelete) {
      await dispatch(deleteTrack(trackToDelete._id));
      setDeleteDialogOpen(false);
      setTrackToDelete(null);
    }
  };

  const handlePaginationChange = (newPagination: { page: number; pageSize: number }) => {
    dispatch(setPagination(newPagination));
  };

  const handleCategoryFilterChange = (event: SelectChangeEvent) => {
    dispatch(setCategoryFilter(event.target.value));
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }));
  };

  const handleAuthorFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setAuthorFilter(event.target.value));
    dispatch(setPagination({ page: 1, pageSize: pagination.pageSize }));
  };

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = new Set(tracks.map(track => track.category).filter(Boolean));
    return Array.from(uniqueCategories);
  }, [tracks]);

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
      field: 'author',
      headerName: 'Author',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value || 'Unknown'}
        </Typography>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Uncategorized'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'trending',
      headerName: 'Trending',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'success' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
        />
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
    // {
    //   field: 'playlists',
    //   headerName: 'Playlists',
    //   flex: 1,
    //   minWidth: 150,
    //   renderCell: (params) => {
    //     const playlists = params.value as any[] || [];
    //     if (playlists.length === 0) {
    //       return <Typography variant="body2" color="text.secondary">None</Typography>;
    //     }
    //     return (
    //       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
    //         {playlists.slice(0, 2).map((playlist: any) => (
    //           <Chip
    //             key={playlist._id}
    //             label={playlist.title || 'Untitled'}
    //             size="small"
    //             variant="outlined"
    //           />
    //         ))}
    //         {playlists.length > 2 && (
    //           <Chip
    //             label={`+${playlists.length - 2} more`}
    //             size="small"
    //             variant="outlined"
    //           />
    //         )}
    //       </Box>
    //     );
    //   },
    // },
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
          onClick={() => navigate(`/tracks/${params.id}`)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title="Edit">
              <EditIcon size={18} />
            </Tooltip>
          }
          label="Edit"
          onClick={() => navigate(`/tracks/${params.id}/edit`)}
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
          Tracks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon size={20} />}
          onClick={() => navigate('/tracks/new')}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            py: 1,
          }}
        >
          Add Track
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
          placeholder="Search tracks..."
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

        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
            displayEmpty
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          >
            <MenuItem value="">
              All Categories
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          placeholder="Filter by author..."
          value={authorFilter}
          onChange={handleAuthorFilterChange}
          size="small"
          sx={{
            minWidth: 200,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />

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
          rows={loading ? [] : filteredTracks}
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
        <DialogTitle>Delete Track</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{trackToDelete?.title || 'this track'}"?
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

export default TrackList;