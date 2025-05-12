/* LecturerList.js — full working version
   • React 18 / MUI 5
   • Talks to /lecturers?limit=…&next=…&prev=…
------------------------------------------------------------------ */
import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Avatar, Chip, Typography, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, IconButton, Tooltip, Button,
  useTheme, useMediaQuery, Select, MenuItem, FormControl, InputLabel
  
} from '@mui/material';
import {
  Search, Delete, Edit, Warning, Person,
  ArrowBack, ArrowForward
} from '@mui/icons-material';
import { api } from '../api';

const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

export default function LecturerList() {
  /* ---------------- state ---------------- */
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [lecturers, setLecturers]  = useState([]);
  const [loading,   setLoading]    = useState(true);
  const [error,     setError]      = useState('');
  const [search,    setSearch]     = useState('');
  const [limit,     setLimit]      = useState(5);      // page size selector
  const [offset,    setOffset]     = useState(0);      // current offset
  const [nextOff,   setNextOff]    = useState(null);   // from API
  const [prevOff,   setPrevOff]    = useState(null);   // from API
const [openEditDialog, setOpenEditDialog] = useState(false);
const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
const [selectedLecturer, setSelectedLecturer] = useState(null);
const [editedLecturer, setEditedLecturer] = useState(null);
  /* ---------------- fetch ---------------- */
  const fetchLecturers = useCallback(async (off = 0, lim = limit) => {
    try {
      setLoading(true);
      const q = [`limit=${lim}`];
      if (off > 0) q.push(`next=${off}`);
      const { data } = await api.get(`/lecturers?${q.join('&')}`);
      setLecturers(data.data);
      setNextOff(data.next);
      setPrevOff(data.prev);
      setOffset(off);
      setError('');
    } catch (e) {
      console.error(e);
      setError('Failed to fetch lecturers');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchLecturers(0, limit); }, [limit, fetchLecturers]);

  /* ---------------- pagination handlers ---------------- */
  const handleNext = () => nextOff != null && fetchLecturers(nextOff);
  const handlePrev = () => prevOff != null && fetchLecturers(prevOff);

  /* ---------------- filtered view ---------------- */
  const filtered = lecturers.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- render helpers ---------------- */
  const dayChips = (list=[]) => (
    list.length
      ? validDays.map(day => (
          <Chip
            key={day}
            label={day}
            size="small"
            sx={{ mr: .5, mb: .5 }}
            color={list.includes(day) ? 'default' : 'primary'}
            variant={list.includes(day) ? 'outlined' : 'filled'}
          />
        ))
      : <Chip label="Available all days" size="small" color="success" />
  );
const handleOpenEditDialog = (lecturer) => {
  setSelectedLecturer(lecturer);
  setEditedLecturer({ ...lecturer });
  setOpenEditDialog(true);
};

const handleOpenDeleteDialog = (lecturer) => {
  setSelectedLecturer(lecturer);
  setOpenDeleteDialog(true);
};

const handleCloseDialogs = () => {
  setOpenEditDialog(false);
  setOpenDeleteDialog(false);
  setSelectedLecturer(null);
  setEditedLecturer(null);
};

const handleEdit = async () => {
  try {
    await api.put(`/lecturers/${editedLecturer.id}/day-offs`, {
      day_offs: editedLecturer.day_offs,
    });
    fetchLecturers(offset, limit);
    handleCloseDialogs();
  } catch (err) {
    console.error("Error updating lecturer:", err);
  }
};

const handleDelete = async () => {
  try {
    await api.delete(`/lecturers/${selectedLecturer.id}`);
    fetchLecturers(offset, limit);
    handleCloseDialogs();
  } catch (err) {
    console.error("Error deleting lecturer:", err);
  }
};
  /* ---------------- main render ---------------- */
  if (loading) return (
    <Box sx={{ textAlign:'center', mt:6 }}>
      <CircularProgress /><Typography sx={{ mt:1 }}>Loading …</Typography>
    </Box>
  );
  if (error) return (
    <Alert severity="error" sx={{ mt:4, maxWidth:480, mx:'auto' }}>{error}</Alert>
  );

  return (
    <Box sx={{ p:isMobile?1:3 }}>
      {/* header & search */}
      <Box sx={{
        display:'flex', flexDirection:isMobile?'column':'row',
        justifyContent:'space-between', alignItems:isMobile?'stretch':'center',
        mb:3, gap:2
      }}>
        <Typography variant="h5" fontWeight="bold">
          Lecturers&nbsp;
          <Chip label={filtered.length} color="primary" size="small" />
        </Typography>

        <TextField
          size="small"
          placeholder="Search lecturers…"
          value={search}
          onChange={e=>setSearch(e.target.value)}
          InputProps={{
            startAdornment:(
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            sx:{ borderRadius:5 }
          }}
          sx={{ width:isMobile?'100%':300 }}
        />
      </Box>

      {/* table */}
      <TableContainer component={Paper} sx={{ borderRadius:2, maxHeight:500 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Lecturer</TableCell>
              <TableCell>Availability</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(row=>(
              <TableRow key={row.id} hover>
                <TableCell>
                  <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
                    <Avatar sx={{ bgcolor:'primary.main' }}><Person/></Avatar>
                    {row.name}
                  </Box>
                </TableCell>
                <TableCell>{dayChips(row.day_offs)}</TableCell>
                <TableCell align="center">
                  {/* dummy actions – hook up your edit/delete handlers here */}
<TableCell align="center">
  <Tooltip title="Edit availability">
    <IconButton
      onClick={() => handleOpenEditDialog(row)}
      sx={{ color: 'primary.main' }}
    >
      <Edit />
    </IconButton>
  </Tooltip>

  <Tooltip title="Delete lecturer">
    <IconButton
      onClick={() => handleOpenDeleteDialog(row)}
      sx={{ color: 'error.main' }}
    >
      <Delete />
    </IconButton>
  </Tooltip>
</TableCell>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* footer pagination bar */}
      <Box sx={{
        mt:2, display:'flex', alignItems:'center', justifyContent:'space-between',
        flexWrap:'wrap', gap:2
      }}>
        {/* limit selector */}
        <FormControl size="small">
          <InputLabel>Rows</InputLabel>
          <Select
            value={limit}
            label="Rows"
            onChange={e=>setLimit(Number(e.target.value))}
            sx={{ minWidth:80 }}
          >
            {[3,5,10,20,40].map(n=>(
              <MenuItem key={n} value={n}>{n}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Prev / Next */}
        <Box sx={{ ml:'auto', display:'flex', alignItems:'center', gap:1 }}>
          <Button
            startIcon={<ArrowBack/>}
            disabled={prevOff==null}
            onClick={handlePrev}
          >
            Prev
          </Button>

          {/* current page chip */}
          <Chip
            label={Math.floor(offset/limit)+1}
            variant="outlined"
            sx={{ fontWeight:'bold' }}
          />

          <Button
            endIcon={<ArrowForward/>}
            disabled={nextOff==null}
            onClick={handleNext}
          >
            Next
          </Button>
        </Box>
      </Box>
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
  <DialogTitle>Edit Lecturer</DialogTitle>
  <DialogContent>
    <TextField
      fullWidth
      label="Lecturer Name"
      value={editedLecturer?.name || ""}
      onChange={(e) =>
        setEditedLecturer({ ...editedLecturer, name: e.target.value })
      }
      sx={{ mb: 2 }}
    />

    <FormControl fullWidth>
      <InputLabel>Days Off</InputLabel>
      <Select
        multiple
        value={editedLecturer?.day_offs || []}
        onChange={(e) =>
          setEditedLecturer({ ...editedLecturer, day_offs: e.target.value })
        }
        renderValue={(selected) => selected.join(", ")}
      >
        {validDays.map((day) => (
          <MenuItem key={day} value={day}>
            {day}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialogs}>Cancel</Button>
    <Button onClick={handleEdit} variant="contained">Save</Button>
  </DialogActions>
</Dialog>
<Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
  <DialogTitle>Delete Lecturer</DialogTitle>
  <DialogContent>
    Are you sure you want to delete <strong>{selectedLecturer?.name}</strong>?
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialogs}>Cancel</Button>
    <Button onClick={handleDelete} variant="contained" color="error">
      Delete
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
}
