
// LectureSchedulePage.jsx
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Stack,
  CircularProgress,
  GlobalStyles,
} from '@mui/material';
import {
  Print as PrintIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';

/* ------------------------------------------------------------------ */
/*                       🔗   API helpers (GET / DELETE)               */
/* ------------------------------------------------------------------ */
const fetchLectures = async () => {
  const { data } = await axios.get('http://localhost:5000/api/lectures');
  return data.data;
};
const deleteLecture = async (id) =>
  axios.delete(`http://localhost:5000/api/lectures/${id}`);

/* ------------------------------------------------------------------ */
/*                       📋   Schedule table UI                        */
/* ------------------------------------------------------------------ */
function ScheduleTable() {
  const queryClient = useQueryClient();

  /* ---------- data fetching ---------- */
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['lectures'],
    queryFn: fetchLectures,
  });

  /* ---------- delete action ---------- */
  const deleteMutation = useMutation({
    mutationFn: deleteLecture,
    onSuccess: () => queryClient.invalidateQueries(['lectures']),
  });

  return (
    <>
      {/* print-only rules */}
      <GlobalStyles
        styles={{
          '@media print': {
            body: { margin: 0 },
            '.no-print': { display: 'none !important' },
            '.print-paper': { boxShadow: 'none !important' },
          },
        }}
      />

      <Paper className="print-paper" sx={{ p: 3 }}>
        {/* header bar */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          className="no-print"
          mb={2}
        >
          <Typography variant="h5" fontWeight={600}>
            Lecture Schedule
          </Typography>

          <Box>
            <Tooltip title="Refresh">
              <IconButton onClick={refetch}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton onClick={() => window.print()}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>

        {/* table */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error">Failed to load schedule.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Day</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Lecturers</TableCell>
                <TableCell className="no-print" align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((lec) => (
                <TableRow key={lec.id} hover>
                  <TableCell>{lec.course_name}</TableCell>
                  <TableCell>{lec.day_of_week}</TableCell>
                  <TableCell>
                    {lec.start_time.slice(0, 5)} – {lec.end_time.slice(0, 5)}
                  </TableCell>
                  <TableCell>{lec.stage}</TableCell>
                  <TableCell>{lec.Room?.name ?? '-'}</TableCell>
                  <TableCell>
                    {lec.Lecturers.map((l) => l.name).join(', ')}
                  </TableCell>
                  <TableCell className="no-print" align="right">
                    <IconButton
                      size="small"
                      onClick={() => deleteMutation.mutate(lec.id)}
                    >
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*               🚀   Exportable page WITH React-Query                 */
/* ------------------------------------------------------------------ */
const client = new QueryClient();

export default function LectureSchedulePage() {
  return (
    <QueryClientProvider client={client}>
      <ScheduleTable />
    </QueryClientProvider>
  );
}
