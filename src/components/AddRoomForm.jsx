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
  Alert
} from '@mui/material';
import { api } from '../api';

export default function RoomManager() {
  const [room, setRoom] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post('/rooms', { room_name: room });
      setRoom('');
      await fetchRooms(); // Refresh the list after adding
      setSnackbarOpen(true);
    } catch (err) {
      setError('Failed to add room');
      console.error(err);
    }
  };

  return (
    <Stack spacing={3} sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      {/* Add Room Form */}
      <Paper sx={{ p: 3 }} elevation={3}>
        <Stack component="form" spacing={2} onSubmit={submit}>
          <TextField 
            label="Room name" 
            value={room} 
            onChange={e => setRoom(e.target.value)} 
            required 
            fullWidth
          />
          <Button 
            variant="contained" 
            type="submit"
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Room
          </Button>
        </Stack>
      </Paper>

      {/* Rooms Table */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Room Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ color: 'error.main' }}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No rooms found
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map(room => (
                  <TableRow key={room.id}>
                    <TableCell>{room.id}</TableCell>
                    <TableCell>{room.room_name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Success Notification */}
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