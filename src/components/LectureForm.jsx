import { useEffect, useState } from 'react';
import {
  Box, Button, Paper, MenuItem, Select, TextField, Typography,
  InputLabel, OutlinedInput, FormControl, Chip
} from '@mui/material';
import { api } from '../api';

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday'];

export default function LectureForm({ onCreated }) {
  const [rooms, setRooms] = useState([]);
  const [lecturers, setLecturers] = useState([]);

  const [form, setForm] = useState({
    course_name:'', room_id:'', day_of_week:'Sunday',
    start_time:'08:00', end_time:'09:00', lecturer_ids:[],
  });

  // fetch options once
  useEffect(() => {
    Promise.all([api.get('/rooms'), api.get('/lecturers')])
      .then(([rRooms, rLect]) => {
        setRooms(rRooms.data);
        setLecturers(rLect.data);
      });
  },[]);

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lectures', form);
      onCreated?.();
      setForm({ ...form, course_name:'', lecturer_ids:[] });
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating lecture');
    }
  };

  return (
    <Paper sx={{ p:3, mb:4,mt:2 }} elevation={4}>
      <Typography variant="h6" gutterBottom>New Lecture</Typography>
      <Box component="form" onSubmit={submit} sx={{ display:'grid', gap:2 }}>
        <TextField label="Course name" fullWidth
          value={form.course_name} onChange={handleChange('course_name')} />

        <FormControl fullWidth>
          <InputLabel>Day of week</InputLabel>
          <Select label="Day of week" value={form.day_of_week}
                  onChange={handleChange('day_of_week')}>
            {days.map(d=> <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>

        <Box sx={{ display:'flex', gap:2 }}>
          <TextField type="time" label="Start time" fullWidth
            value={form.start_time} onChange={handleChange('start_time')}
            InputLabelProps={{ shrink:true }} />
          <TextField type="time" label="End time" fullWidth
            value={form.end_time} onChange={handleChange('end_time')}
            InputLabelProps={{ shrink:true }} />
        </Box>

        <FormControl fullWidth>
          <InputLabel>Room</InputLabel>
          <Select label="Room" value={form.room_id}
                  onChange={handleChange('room_id')}>
            {rooms.map(r=> <MenuItem key={r.id} value={r.id}>{r.room_name}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Lecturers</InputLabel>
          <Select multiple label="Lecturers"
                  input={<OutlinedInput label="Lecturers" />}
                  value={form.lecturer_ids}
                  onChange={handleChange('lecturer_ids')}
                  renderValue={(selected)=>(
                    <Box sx={{ display:'flex', flexWrap:'wrap', gap:0.5 }}>
                      {selected.map(id=>{
                        const l = lecturers.find(x=>x.id===id);
                        return <Chip key={id} label={l?.name || id} />;
                      })}
                    </Box>
                  )}>
            {lecturers.map(l=> <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
          </Select>
        </FormControl>

        <Button variant="contained" type="submit">Save</Button>
      </Box>
    </Paper>
  );
}
