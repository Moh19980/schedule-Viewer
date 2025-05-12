import { useState } from 'react';
import { TextField, Button, Stack, FormControlLabel, Checkbox, Typography, Box, Snackbar, Alert } from '@mui/material';
import { api } from '../api';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

export default function AddLecturerForm() {
  const [name, setName] = useState('');
  const [dayOffs, setDayOffs] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleDayOffChange = (day) => {
    setDayOffs((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lecturers', { name, day_offs: dayOffs });
      setName('');
      setDayOffs([]);
      setSnackbar({ open: true, message: 'Lecturer added successfully', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error adding lecturer', severity: 'error' });
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={submit} sx={{ p: 2, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h6" mb={2}>Add New Lecturer</Typography>

      <TextField
        label="Lecturer Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        fullWidth
      />

      <Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Select Days Off:
        </Typography>
        <Stack spacing={1}>
          {daysOfWeek.map((day) => (
            <FormControlLabel
              key={day}
              control={
                <Checkbox
                  checked={dayOffs.includes(day)}
                  onChange={() => handleDayOffChange(day)}
                />
              }
              label={day}
            />
          ))}
        </Stack>
      </Box>

      <Button variant="contained" type="submit" sx={{ mt: 2 }}>
        Add Lecturer
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
