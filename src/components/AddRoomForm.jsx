import { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Stack, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Box,
  Typography
} from '@mui/material';
import { api } from '../api';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import RoomIcon from '@mui/icons-material/MeetingRoom';

export default function RoomManager() {
  const [room, setRoom] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rooms');
      setRooms(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rooms', { room_name: room });
      setRoom('');
      setShowForm(false);
      fetchRooms();
      setSnackbarOpen(true);
    } catch (err) {
      setError('Failed to add room');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/rooms/${id}`);
      fetchRooms();
    } catch (err) {
      console.error('Error deleting room:', err);
    }
  };

  return (
    <Stack spacing={3} sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          Rooms Management
        </Typography>
        <Button
          startIcon={<AddCircleOutlineIcon />}
          variant="contained"
          onClick={() => setShowForm(!showForm)}
          sx={{ borderRadius: 2 }}
        >
          {showForm ? "Cancel" : "Add Room"}
        </Button>
      </Box>

      {showForm && (
        <Paper sx={{ p: 3, mb: 2, boxShadow: 4 }}>
          <Stack component="form" spacing={2} onSubmit={addRoom}>
            <TextField 
              label="Room Name" 
              value={room} 
              onChange={(e) => setRoom(e.target.value)} 
              required 
              fullWidth 
              autoFocus
            />
            <Button variant="contained" type="submit" sx={{ borderRadius: 2 }}>
              Save Room
            </Button>
          </Stack>
        </Paper>
      )}

      <Paper sx={{ boxShadow: 4 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Room ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Room Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ color: 'error.main' }}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No rooms found
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <RoomIcon sx={{ mr: 1, color: 'primary.main' }} />
                      {room.id}
                    </TableCell>
                    <TableCell>{room.room_name}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Delete Room">
                        <IconButton color="error" onClick={() => handleDelete(room.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Room added successfully!
        </Alert>
      </Snackbar>
    </Stack>
  );
}
