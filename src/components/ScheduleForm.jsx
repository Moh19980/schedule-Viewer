import { useEffect, useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Stack,
  FormControl,
  InputLabel,
  OutlinedInput,
  Box,
  IconButton,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { api } from "../api";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const stages = ["stage1", "stage2", "stage3", "stage4"];

export default function ScheduleForm() {
  const [rooms, setRooms] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [form, setForm] = useState({
    course_name: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    room_id: "",
    stage: "stage1",
    lecturer_ids: [null],
  });

  /* Fetch rooms and lecturers */
  useEffect(() => {
    Promise.all([api.get("/rooms"), api.get("/lecturers")]).then(
      ([roomsRes, lecturersRes]) => {
        setRooms(roomsRes.data);
        setLecturers(lecturersRes.data);
      }
    );
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const updateLecturer = (idx, val) => {
    const arr = [...form.lecturer_ids];
    arr[idx] = val;
    setForm({ ...form, lecturer_ids: arr });
  };

  const addLecturer = () =>
    setForm({ ...form, lecturer_ids: [...form.lecturer_ids, null] });

  const removeLecturer = (idx) => {
    const arr = form.lecturer_ids.filter((_, i) => i !== idx);
    setForm({ ...form, lecturer_ids: arr.length ? arr : [null] });
  };

const addEntry = async (e) => {
  e.preventDefault();

  const payload = {
    ...form,
    lecturer_ids: form.lecturer_ids.filter(Boolean),
  };

  try {
    await api.post("/lectures", payload);
    setSnackbar({
      open: true,
      message: "Lecture added successfully",
      severity: "success",
    });

    setForm({
      course_name: "",
      day_of_week: "",
      start_time: "",
      end_time: "",
      room_id: "",
      stage: "stage1",
      lecturer_ids: [null],
    });
  } catch (err) {
    console.error(err);

    const errorMessage =
      err.response?.data?.message || "Error adding lecture";

    const conflicts = err.response?.data?.conflicts || [];

    if (conflicts.length > 0) {
      // If there are conflicts, format the message to display all of them
      const formattedConflicts = conflicts
        .map((conflict) => conflict.reason)
        .join("\n");

      setSnackbar({
        open: true,
        message: formattedConflicts,
        severity: "error",
      });
    } else {
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  }
};

  const resetSchedule = () => {
    setForm({
      course_name: "",
      day_of_week: "",
      start_time: "",
      end_time: "",
      room_id: "",
      stage: "stage1",
      lecturer_ids: [null],
    });
    setSnackbar({ open: true, message: "Schedule reset", severity: "info" });
  };

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          "& .MuiAlert-root": {
            width: "100%",
            fontSize: "1rem",
            fontWeight: "bold",
          },
        }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box component="form" onSubmit={addEntry} sx={{ width: "100%", maxWidth: 800, mx: "auto", mt: 4, p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Add New Schedule Entry
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Fill in the details to add a new schedule entry.
        </Typography>

        <Stack spacing={3}>
          {/* Lecturers */}
          <Box>
            <Typography gutterBottom>Lecturers</Typography>
            <Stack spacing={2}>
              {form.lecturer_ids.map((val, idx) => (
                <Stack direction="row" spacing={2} alignItems="center" key={idx}>
                  <FormControl fullWidth>
                    <InputLabel>{`Lecturer ${idx + 1}`}</InputLabel>
                    <Select
                      value={val || ""}
                      onChange={(e) => updateLecturer(idx, e.target.value)}
                      input={<OutlinedInput label={`Lecturer ${idx + 1}`} />}
                      required
                    >
                      {lecturers.map((l) => (
                        <MenuItem key={l.id} value={l.id}>
                          {l.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {form.lecturer_ids.length > 1 && (
                    <IconButton color="error" onClick={() => removeLecturer(idx)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Stack>
              ))}

              <Button
                startIcon={<AddCircleOutlineIcon />}
                variant="text"
                onClick={addLecturer}
              >
                Add Lecturer
              </Button>
            </Stack>
          </Box>

          {/* Subject */}
          <TextField
            label="Subject *"
            value={form.course_name}
            onChange={update("course_name")}
            fullWidth
            required
          />

          {/* Day & Room */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth required>
              <InputLabel>Day of Week</InputLabel>
              <Select value={form.day_of_week} onChange={update("day_of_week")}>
                {days.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Room</InputLabel>
              <Select value={form.room_id} onChange={update("room_id")}>
                {rooms.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.room_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Stage */}
          <FormControl fullWidth required>
            <InputLabel>Stage</InputLabel>
            <Select value={form.stage} onChange={update("stage")}>
              {stages.map((stage) => (
                <MenuItem key={stage} value={stage}>
                  {stage}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Time */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              type="time"
              label="Start Time *"
              value={form.start_time}
              onChange={update("start_time")}
              fullWidth
              required
            />
            <TextField
              type="time"
              label="End Time *"
              value={form.end_time}
              onChange={update("end_time")}
              fullWidth
              required
            />
          </Stack>

          <Button variant="contained" startIcon={<AddCircleOutlineIcon />} type="submit">
            Add Entry
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
          <Button startIcon={<RestartAltIcon />} variant="outlined" color="error" onClick={resetSchedule}>
            Reset Schedule
          </Button>
        </Stack>
      </Box>
    </>
  );
}
