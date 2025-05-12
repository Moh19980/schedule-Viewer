import { useState } from 'react';
import { TextField, Button, Stack } from '@mui/material';
import { api } from '../api';

export default function AddRoomForm() {
  const [room, setRoom] = useState('');

  const submit = async e => {
    e.preventDefault();
    await api.post('/rooms', { room_name: room });
    setRoom('');
    alert('Room added');
  };

  return (
    <Stack component="form" spacing={2} onSubmit={submit} sx={{ p:2 }}>
      <TextField label="Room name" value={room} onChange={e=>setRoom(e.target.value)} required />
      <Button variant="contained" type="submit">Add Room</Button>
    </Stack>
  );
}
