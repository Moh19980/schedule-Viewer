// ScheduleForm.jsx
import { useEffect, useState, useRef, useCallback, memo } from "react";
import {
  Container,
  TextField,
  Button,
  Stack,
  FormControl,
  Card,
  CardContent,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  Box,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import axios from "axios";
import { api } from "../api";

/* ------------------------------------------------------------------ */

const days      = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const PAGE_SIZE = 5;           // lecturer search page size
const DEBOUNCE  = 350;         // ms

/* ---------- utils ---------- */
function dedupeById(list) {
  const map = new Map();
  for (const item of list) {
    if (item && item.id != null && !map.has(item.id)) map.set(item.id, item);
  }
  return Array.from(map.values());
}

/* ---------- memoised lecturer input ---------- */
const LecturerInput = memo(function LecturerInput({
  idx,
  id,
  lecturers,
  loading,
  valueObject,          // <- نمرر الأوبجكت المختار مباشرة
  inputValue,           // <- نص البحث الخاص بهذا الصف
  onChange,             // (idx, id, object)
  onInputChange,        // (idx, value)
}) {
  return (
    <Autocomplete
      fullWidth
      options={lecturers}
      loading={loading}
      getOptionLabel={(o) => o?.name ?? ""}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      value={valueObject || null}
      inputValue={inputValue}
      onInputChange={(_, val, reason) => {
        // خفّض الضوضاء: تجاهل clear التلقائي إذا ما نحتاجه
        if (reason === "reset") return;
        onInputChange(idx, val);
      }}
      onChange={(_, v) => onChange(idx, v ? v.id : null, v || null)}
      clearOnBlur={false}
      handleHomeEndKeys
      renderInput={(params) => (
        <TextField
          {...params}
          label={`Lecturer ${idx + 1}`}
          placeholder="Start typing…"
          required
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={18} color="inherit" />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
});

/* ------------------------------------------------------------------ */

export default function ScheduleForm() {
  const theme = useTheme();

  /* ---------- refs ---------- */
  const cancelRef = useRef(null); // axios cancel token
  const debounceRefs = useRef({}); // لكل صف تايمر خاص

  /* ---------- data state ---------- */
  const [rooms,     setRooms]     = useState([]);
  const [lecturers, setLecturers] = useState([]);   // options المعروضة حاليًا
  const [stages,    setStages]    = useState([]);

  /* ---------- caches ---------- */
  const [selectedMap, setSelectedMap] = useState({}); // { [id]: lecturerObj }

  /* ---------- UI / control state ---------- */
  const [loadingLecturers, setLoadingLecturers] = useState(false);
  const [loadingStages,    setLoadingStages]    = useState(false);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [openResetDialog,  setOpenResetDialog]  = useState(false);

  const [snackbar, setSnackbar] = useState({
    open    : false,
    message : "",
    severity: "success",
  });

  /* ---------- form state ---------- */
  const initialForm = {
    course_name : "",
    day_of_week : "",
    start_time  : null,
    end_time    : null,
    room_id     : "",
    stage_id    : null,
    lecturer_ids: [null],
  };
  const [form, setForm] = useState(initialForm);

  // لكل صف قيمة نص البحث الخاصة به
  const [inputValues, setInputValues] = useState([""]);

  /* ───────────────── fetch helpers ───────────────── */

  const fetchStaticData = async () => {
    setLoadingStages(true);
    try {
      const [stageRes, roomRes] = await Promise.all([
        api.get("/stages"),
        api.get("/rooms"),
      ]);
      setStages(stageRes.data || []);
      setRooms(roomRes.data || []);
    } catch {
      setStages([]);
      setRooms([]);
    } finally {
      setLoadingStages(false);
    }
  };

  const fetchLecturers = async (q = "") => {
    if (cancelRef.current) cancelRef.current.cancel();
    cancelRef.current = axios.CancelToken.source();

    setLoadingLecturers(true);
    try {
      const res = await api.get(`/lecturers?search=${encodeURIComponent(q)}&limit=${PAGE_SIZE}`, {
        cancelToken: cancelRef.current.token,
      });
      const fetched = res.data?.data || [];
      // ادمج مع المختارين حتى لا يختفوا من الـ options
      setLecturers((prev) =>
        dedupeById([...Object.values(selectedMap), ...fetched])
      );
    } catch {
      // cancelled or failed
      setLecturers((prev) => dedupeById([...Object.values(selectedMap)]));
    } finally {
      setLoadingLecturers(false);
    }
  };

  /* ───────────────── initial load ───────────────── */
  useEffect(() => {
    fetchStaticData();
    fetchLecturers(""); // أولي
    return () => {
      if (cancelRef.current) cancelRef.current.cancel();
      // نظف كل الديباونس
      Object.values(debounceRefs.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  /* ───────────────── small setters ───────────────── */
  const updateForm = useCallback((field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  }, []);

  const updateLecturer = useCallback((idx, id, obj) => {
    setForm((prev) => {
      const arr = [...prev.lecturer_ids];
      arr[idx]  = id;
      return { ...prev, lecturer_ids: arr };
    });
    // خزّن الأوبجكت المختار (لو موجود)
    if (obj && obj.id != null) {
      setSelectedMap((m) => ({ ...m, [obj.id]: obj }));
      // واحرص إنو يظل ضمن الـ options
      setLecturers((prev) => dedupeById([obj, ...prev]));
    } else if (id == null) {
      // لا شيء
    }
  }, []);

  const addLecturer = () => {
    updateForm("lecturer_ids", [...form.lecturer_ids, null]);
    setInputValues((prev) => [...prev, ""]);
  };

  const removeLecturer = (idx) => {
    const arr = form.lecturer_ids.filter((_, i) => i !== idx);
    updateForm("lecturer_ids", arr.length ? arr : [null]);
    setInputValues((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateInputValue = (idx, val) => {
    setInputValues((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });

    // ديباونس لكل صف لحاله
    if (debounceRefs.current[idx]) clearTimeout(debounceRefs.current[idx]);
    debounceRefs.current[idx] = setTimeout(() => {
      fetchLecturers(val.trim());
    }, DEBOUNCE);
  };

  /* ───────────────── submit ───────────────── */
  const addEntry = async (e) => {
    e.preventDefault();

    if (form.start_time && form.end_time && form.end_time < form.start_time) {
      setSnackbar({ open: true, message: "End time cannot be earlier than start time", severity: "error" });
      return;
    }

    setIsSubmitting(true);

    // helper to HH:MM
    const toHM = (d) =>
      d ? `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}` : "";

    const payload = {
      ...form,
      lecturer_ids: form.lecturer_ids.filter(Boolean),
      start_time  : toHM(form.start_time),
      end_time    : toHM(form.end_time),
    };

    try {
      await api.post("/lectures", payload);
      setSnackbar({ open: true, message: "Lecture added successfully", severity: "success" });
      setForm(initialForm);
      setInputValues([""]);
      // لا نمسح selectedMap؛ مو مشكلة يبقى ككاش خفيف
      fetchLecturers(""); // refresh options
    } catch (err) {
      const msg = err.response?.data?.message || "Error adding lecture";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ───────────────── reset ───────────────── */
  const handleReset = () => {
    setForm(initialForm);
    setInputValues([""]);
    setSnackbar({ open: true, message: "Schedule form has been reset", severity: "info" });
    setOpenResetDialog(false);
    fetchLecturers("");
  };

  /* ───────────────── UI ───────────────── */
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ pb: 8 }}>
        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            variant="filled"
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Reset dialog */}
        {openResetDialog && (
          <Dialog open onClose={() => setOpenResetDialog(false)}>
            <DialogTitle>Confirm Reset</DialogTitle>
            <DialogContent>
              <DialogContentText>All unsaved changes will be lost. Continue?</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenResetDialog(false)}>Cancel</Button>
              <Button onClick={handleReset} color="error" autoFocus>
                Reset
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Form */}
        <Box component="form" onSubmit={addEntry} sx={{ mt: 6 }}>
          <Typography variant="h4" align="center" fontWeight={600} gutterBottom>
            Add Lecture / Schedule Entry
          </Typography>

          {/* ─────────── Lecturers ─────────── */}
          <Card
            variant="outlined"
            sx={{ mt: 4, borderLeft: `6px solid ${theme.palette.primary.main}` }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Lecturer(s) <sup style={{ color: theme.palette.error.main }}>*</sup>
              </Typography>

              <Stack spacing={2}>
                {form.lecturer_ids.map((id, idx) => {
                  const valueObject =
                    (id != null && selectedMap[id]) ||
                    (id != null && lecturers.find((l) => l.id === id)) ||
                    null;

                  return (
                    <Stack key={idx} direction="row" spacing={1} alignItems="center">
                      <FormControl fullWidth>
                        <LecturerInput
                          idx={idx}
                          id={id}
                          lecturers={lecturers}
                          loading={loadingLecturers}
                          valueObject={valueObject}
                          inputValue={inputValues[idx] ?? ""}
                          onChange={updateLecturer}
                          onInputChange={updateInputValue}
                        />
                      </FormControl>

                      {form.lecturer_ids.length > 1 && (
                        <IconButton color="error" onClick={() => removeLecturer(idx)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>
                  );
                })}

                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={addLecturer}
                >
                  Add Lecturer
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* ─────────── Course details ─────────── */}
          <Card
            variant="outlined"
            sx={{ mt: 4, borderLeft: `6px solid ${theme.palette.secondary.main}` }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Course Details
              </Typography>

              <Stack spacing={3}>
                <TextField
                  label="Course / Subject Name"
                  value={form.course_name}
                  onChange={(e) => updateForm("course_name", e.target.value)}
                  fullWidth
                  required
                />

                <FormControl fullWidth required>
                  <Autocomplete
                    options={stages}
                    loading={loadingStages}
                    getOptionLabel={(o) => o.name}
                    value={stages.find((s) => s.id === form.stage_id) || null}
                    onChange={(_, v) => updateForm("stage_id", v ? v.id : null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Stage"
                        placeholder="Select a stage"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingStages && <CircularProgress size={20} />}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </FormControl>
              </Stack>
            </CardContent>
          </Card>

          {/* ─────────── Location & time ─────────── */}
          <Card
            variant="outlined"
            sx={{ mt: 4, borderLeft: `6px solid ${theme.palette.info.main}` }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Location & Time
              </Typography>

              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                >
                  <FormControl fullWidth required>
                    <Autocomplete
                      options={days}
                      value={form.day_of_week || null}
                      onChange={(_, v) => updateForm("day_of_week", v || "")}
                      renderInput={(p) => (
                        <TextField {...p} label="Day of Week" required />
                      )}
                    />
                  </FormControl>

                  <FormControl fullWidth required>
                    <Autocomplete
                      options={rooms}
                      getOptionLabel={(r) => r.room_name ?? ""}
                      isOptionEqualToValue={(a, b) => a.id === b.id}
                      value={rooms.find((r) => r.id === form.room_id) || null}
                      onChange={(_, v) => updateForm("room_id", v ? v.id : "")}
                      renderInput={(p) => (
                        <TextField {...p} label="Room" required />
                      )}
                    />
                  </FormControl>
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                >
                  <TimePicker
                    ampm
                    minutesStep={5}
                    label="Start Time"
                    value={form.start_time}
                    onChange={(v) => updateForm("start_time", v)}
                    slotProps={{
                      textField: { required: true, fullWidth: true },
                    }}
                  />

                  <TimePicker
                    ampm
                    minutesStep={5}
                    label="End Time"
                    value={form.end_time}
                    onChange={(v) => updateForm("end_time", v)}
                    minTime={form.start_time || undefined}
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                        helperText:
                          form.start_time &&
                          form.end_time &&
                          form.end_time < form.start_time
                            ? "End must be ≥ start"
                            : "",
                        error:
                          form.start_time &&
                          form.end_time &&
                          form.end_time < form.start_time,
                      },
                    }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* ─────────── Buttons ─────────── */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: 5, justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RestartAltIcon />}
              onClick={() => setOpenResetDialog(true)}
              disabled={isSubmitting}
            >
              Reset
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AddCircleOutlineIcon />
                )
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save Entry"}
            </Button>
          </Stack>
        </Box>
      </Container>
    </LocalizationProvider>
  );
}
