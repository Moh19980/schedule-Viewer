/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  MenuItem,
  Select,
  OutlinedInput,
  Checkbox,
  FormControl,
  InputLabel,
  Tooltip,
  Chip,
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Person,
  Search,
  Delete,
  Edit,
  Warning,
  ManageAccounts,
} from "@mui/icons-material";
const validDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
import { api } from "../api";

export default function LecturerList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editedDaysOff, setEditedDaysOff] = useState([]);

  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    try {
      const response = await api.get("/lecturers");
      setLecturers(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch lecturers");
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (lecturer) => {
    setSelectedLecturer(lecturer);
    setOpenDeleteDialog(true);
  };

  const handleOpenEditDialog = (lecturer) => {
    setSelectedLecturer(lecturer);
    setEditedDaysOff(lecturer.day_offs || []);
    setOpenEditDialog(true);
  };

  const handleCloseDialogs = () => {
    setSelectedLecturer(null);
    setOpenDeleteDialog(false);
    setOpenEditDialog(false);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/lecturers/${selectedLecturer.id}`);
      setLecturers(lecturers.filter((lec) => lec.id !== selectedLecturer.id));
      handleCloseDialogs();
    } catch (err) {
      console.error("Error deleting lecturer:", err);
    }
  };

  const handleEdit = async () => {
    try {
      await api.put(`/lecturers/${selectedLecturer.id}/day-offs`, {
        day_offs: editedDaysOff,
      });
      fetchLecturers();
      handleCloseDialogs();
    } catch (err) {
      console.error("Error updating days off:", err);
    }
  };

  const filteredLecturers = lecturers.filter((lecturer) =>
    lecturer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="textSecondary">
          Loading lecturers...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Alert severity="error" sx={{ width: "100%", maxWidth: 500 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3, p: isMobile ? 1 : 3 }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <ManageAccounts sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "text.primary",
            letterSpacing: 1,
          }}
        >
          Lecturers Management
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
          Manage lecturer information and availability
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" color="textSecondary">
          {filteredLecturers.length} Lecturers Found
        </Typography>
        <TextField
          placeholder="Search lecturers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 5, bgcolor: "background.paper" },
          }}
          sx={{ width: isMobile ? "100%" : 320 }}
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[3],
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: "background.paper", fontWeight: "bold", py: 2 }}>
                Lecturer
              </TableCell>
              <TableCell sx={{ bgcolor: "background.paper", fontWeight: "bold", py: 2 }}>
                Availability
              </TableCell>
              <TableCell sx={{ bgcolor: "background.paper", fontWeight: "bold", py: 2, textAlign: "center" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLecturers.map((lecturer) => (
              <TableRow
                key={lecturer.id}
                hover
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell sx={{ py: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <Person />
                    </Avatar>
                    <Typography variant="body1" fontWeight="medium">
                      {lecturer.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  {lecturer.day_offs?.length ? (
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {validDays.map((day) => (
                        <Chip
                          key={day}
                          label={day}
                          color={lecturer.day_offs.includes(day) ? "default" : "primary"}
                          variant={lecturer.day_offs.includes(day) ? "outlined" : "filled"}
                          size="small"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Chip label="Available all days" color="success" size="small" />
                  )}
                </TableCell>
                <TableCell sx={{ py: 2, textAlign: "center" }}>
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                    <Tooltip title="Edit availability">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEditDialog(lecturer)}
                        sx={{ "&:hover": { bgcolor: "primary.light" } }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete lecturer">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(lecturer)}
                        sx={{ "&:hover": { bgcolor: "error.light" } }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredLecturers.length === 0 && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="textSecondary">
              No lecturers found matching your search
            </Typography>
          </Box>
        )}
      </TableContainer>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <Box sx={{ p: 2 }}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Warning color="error" />
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permanently delete{" "}
              <strong>{selectedLecturer?.name}</strong>? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ gap: 2 }}>
            <Button
              onClick={handleCloseDialogs}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              Confirm Delete
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit Dialog */}
   <Dialog
  open={openEditDialog}
  onClose={handleCloseDialogs}
  fullWidth
  maxWidth="sm"
  sx={{
    "& .MuiDialog-paper": {
      borderRadius: 3,
      p: { xs: 2, md: 3 },
      boxShadow: 6,
    },
  }}
>
  <DialogTitle
    sx={{
      textAlign: "center",
      fontWeight: "bold",
      fontSize: { xs: "1.2rem", md: "1.4rem" },
      color: "text.primary",
      borderBottom: `1px solid ${theme.palette.divider}`,
      mb: 2,
    }}
  >
    Edit Availability
  </DialogTitle>

  <DialogContent
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 2,
      py: 2,
      px: { xs: 2, md: 3 },
    }}
  >
    <FormControl fullWidth>
      <InputLabel>Select Days Off</InputLabel>
      <Select
        multiple
        value={editedDaysOff}
        onChange={(e) => setEditedDaysOff(e.target.value)}
        input={<OutlinedInput label="Select Days Off" />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selected.map((day) => (
              <Chip
                key={day}
                label={day}
                size="small"
                sx={{
                  bgcolor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  "&:hover": {
                    bgcolor: theme.palette.primary.main,
                  },
                }}
              />
            ))}
          </Box>
        )}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 4,
            },
          },
        }}
      >
        {validDays.map((day) => (
          <MenuItem key={day} value={day}>
            <Checkbox checked={editedDaysOff.includes(day)} />
            {day}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </DialogContent>

  <DialogActions
    sx={{
      borderTop: `1px solid ${theme.palette.divider}`,
      px: { xs: 2, md: 3 },
      py: 2,
      justifyContent: "space-between",
    }}
  >
    <Button
      onClick={handleCloseDialogs}
      variant="outlined"
      sx={{
        borderRadius: 2,
        color: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        "&:hover": {
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
        },
      }}
    >
      Discard
    </Button>

    <Button
      onClick={handleEdit}
      variant="contained"
      sx={{
        borderRadius: 2,
        bgcolor: theme.palette.primary.main,
        "&:hover": {
          bgcolor: theme.palette.primary.dark,
        },
      }}
    >
      Save
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
}