/*********************************************************************
 *  ModernWeeklySchedule.jsx
 *  – Fully-featured weekly scheduler with printable timetable
 *  – Uses window.print for printing (no external deps)
 *  – Fetches stage list from /stages and filters lectures by StageId
 *********************************************************************/

import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Stack,
  IconButton,
  TextField,
  Menu,
  MenuItem,
  Paper,
  Divider,
  Select,
  FormControl,
  InputLabel,
  alpha,
  useTheme,
  Alert,
  Skeleton,
  Tabs,
  Tab,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemText,
  GlobalStyles,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  CalendarMonth,
  Download,
  Search,
  Refresh,
  FilterList,
  Room,
  Person,
  AccessTime,
  Circle,
  EventNote,
  Close,
  Menu as MenuIcon,
  GridView,
  ViewTimeline,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { format, addWeeks, startOfWeek, endOfWeek } from "date-fns";
import { api } from "../api"; // ← your axios instance

/* ------------------------------------------------------------------ */
/* helpers & constants                                               */
/* ------------------------------------------------------------------ */

const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];

const generateTimeSlots = (startTime, endTime, interval) => {
  const slots = [];
  let cur = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  while (cur <= end) {
    slots.push(cur.toTimeString().slice(0, 5));
    cur = new Date(cur.getTime() + interval * 60_000);
  }
  return slots;
};
const TIME_SLOTS = generateTimeSlots("08:30", "16:30", 60);

/* ------------------------------------------------------------------ */
/* fetch stages hook                                                  */
/* ------------------------------------------------------------------ */

const useStages = () => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/stages"); // → [{ id, name, ... }]
        setStages(res.data);
      } catch (err) {
        console.error("Error fetching stages:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { stages, loading };
};

/* ------------------------------------------------------------------ */
/* tiny UI helpers                                                    */
/* ------------------------------------------------------------------ */

const StyledTimeSlot = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5),
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  height: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const LectureCard = styled(Card)(({ theme, color = "primary" }) => ({
  padding: theme.spacing(1.25),
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  borderLeft: `4px solid ${theme.palette[color].main}`,
  boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
  "&:hover": {
    boxShadow: "0 3px 12px rgba(0,0,0,0.15)",
    transform: "translateY(-2px)",
  },
  transition: "all .2s",
}));

const ColorCircle = styled(Circle)(({ theme, color }) => ({
  fontSize: 12,
  color: theme.palette[color].main,
}));

const ViewTab = styled(Tab)(() => ({ minWidth: 110, fontWeight: 600 }));

const ActionButton = ({ icon, label, onClick, color = "primary", disabled }) => (
  <Button
    variant="outlined"
    size="small"
    color={color}
    startIcon={icon}
    onClick={onClick}
    disabled={disabled}
    sx={{ borderRadius: 2 }}
  >
    {label}
  </Button>
);

/* ------------------------------------------------------------------ */
/* grid & timeline views                                              */
/* ------------------------------------------------------------------ */

const EmptyDay = () => (
  <Box
    sx={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: 2,
      border: "1px dashed",
      borderColor: "divider",
      bgcolor: "background.paper",
      borderRadius: 2,
      minHeight: 120,
    }}
  >
    <Typography color="text.secondary">لا توجد محاضرات مجدولة</Typography>
  </Box>
);

const LectureItem = ({ lecture, idx }) => {
  const palette = ["primary", "secondary", "success", "warning", "info"];
  const color = palette[idx % palette.length];
  return (
    <LectureCard color={color}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography fontWeight={600}>{lecture.course_name}</Typography>
        <ColorCircle color={color} />
      </Box>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <AccessTime fontSize="small" sx={{ fontSize: 15 }} />
        <Typography variant="caption">
          {lecture.start_time.slice(0, 5)} – {lecture.end_time.slice(0, 5)}
        </Typography>
      </Stack>
      {lecture.Room?.room_name && (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Room fontSize="small" sx={{ fontSize: 15 }} />
          <Typography variant="caption">{lecture.Room.room_name}</Typography>
        </Stack>
      )}
      {lecture.Lecturers?.length > 0 && (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Person fontSize="small" sx={{ fontSize: 15 }} />
          <Typography variant="caption" noWrap>
            {lecture.Lecturers.map((l) => l.name).join(", ")}
          </Typography>
        </Stack>
      )}
    </LectureCard>
  );
};

const WeekGrid = ({ grouped, loading }) => {
  if (loading)
    return (
      <Grid container spacing={2}>
        {DAYS_EN.map((_, i) => (
          <Grid key={i} item xs={12} sm={6} md={2.4}>
            <Skeleton variant="rectangular" sx={{ height: 400, borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );

  return (
    <Grid container spacing={2}>
      {DAYS_EN.map((d, i) => {
        const dayLectures = [...(grouped[d] || [])].sort((a, b) =>
          a.start_time.localeCompare(b.start_time)
        );
        return (
          <Grid key={d} item xs={12} sm={6} md={2.4}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                minHeight: 350,
                border: 1,
                borderColor: "divider",
                bgcolor: alpha("#f5f5f5", 0.45),
              }}
            >
              <Typography
                fontWeight={700}
                sx={{ mb: 1.5, textAlign: "center", color: "primary.dark" }}
              >
                {DAYS_AR[i]}
              </Typography>
              {dayLectures.length ? (
                dayLectures.map((lec, idx) => <LectureItem key={lec.id} lecture={lec} idx={idx} />)
              ) : (
                <EmptyDay />
              )}
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

const TimelineView = ({ grouped, loading }) => {
  const theme = useTheme();
  const band = [
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.success.light,
    theme.palette.warning.light,
    theme.palette.info.light,
  ];

  if (loading)
    return <Skeleton variant="rectangular" sx={{ height: 500, borderRadius: 2, mt: 2 }} />;

  return (
    <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 2, overflowX: "auto" }}>
      <Box
        sx={{
          minWidth: 1000,
          display: "grid",
          gridTemplateColumns: "80px repeat(5, 1fr)",
        }}
      >
        {/* header */}
        <Box sx={{ textAlign: "center", p: 1, fontWeight: 600 }}>الوقت</Box>
        {DAYS_AR.map((day, i) => (
          <Box
            key={day}
            sx={{
              textAlign: "center",
              p: 1,
              fontWeight: 600,
              bgcolor: alpha(band[i], 0.15),
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            {day}
          </Box>
        ))}

        {/* body */}
        {TIME_SLOTS.map((t) => (
          <React.Fragment key={t}>
            <StyledTimeSlot>{t}</StyledTimeSlot>
            {DAYS_EN.map((d, i) => {
              const cell = grouped[d]?.filter((l) => l.start_time.startsWith(t)) || [];
              return (
                <Box
                  key={d + t}
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    p: 1,
                    minHeight: 90,
                    bgcolor: cell.length ? alpha(band[i], 0.06) : "transparent",
                  }}
                >
                  {cell.length ? (
                    cell.map((lec) => (
                      <Typography variant="caption" key={lec.id} display="block">
                        {lec.course_name}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="caption" color="text.disabled">
                      —
                    </Typography>
                  )}
                </Box>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Paper>
  );
};

/* ------------------------------------------------------------------ */
/* printable table                                                    */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------
   Printable component
------------------------------------------------------------------ */
const PrintableWeek = React.forwardRef(
  ({ grouped, stageName, weekRange }, ref) => (
    <Box
      ref={ref}
      sx={{
        p: 4,
        width: "297mm",
        margin: "0 auto",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* title */}
      <Typography variant="h5" fontWeight={700}>
        {`جدول محاضرات ${stageName}`}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {weekRange}
      </Typography>

      {/* table */}
      <Box
        sx={{
          mt: 3,
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          display: "grid",
          gridTemplateColumns: "80px repeat(5, 1fr)",
        }}
      >
        {/* header row */}
        <Box sx={{ bgcolor: "#1976d2", color: "#fff", p: 1, fontWeight: 600 }}>
          الوقت
        </Box>
        {DAYS_AR.map((d) => (
          <Box
            key={d}
            sx={{ bgcolor: "#1976d2", color: "#fff", p: 1, fontWeight: 600 }}
          >
            {d}
          </Box>
        ))}

        {/* body rows */}
        {TIME_SLOTS.map((t) => (
          <React.Fragment key={t}>
            {/* left-hand time band */}
            <Box
              sx={{
                p: 1,
                bgcolor: "#f5f5f5",
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              {t}
            </Box>

            {/* five day cells */}
            {DAYS_EN.map((d) => {
              const lectures =
                grouped[d]?.filter(
                  (l) => l.start_time <= t && l.end_time >= t
                ) || [];

              return (
                <Box
                  key={d + t}
                  sx={{
                    p: 0.5,
                    minHeight: 48,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    justifyContent: "center",
                    gap: 0.5,
                    borderLeft: 1,
                    borderColor: "divider",
                  }}
                >
                  {lectures.length ? (
                    lectures.map((lec) => (
                      <Box
                        key={lec.id}
                        sx={{
                          px: 1,
                          py: 0.5,
                          bgcolor: "#f0f4ff",
                          border: "1px solid #c5d0ff",
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontSize: "0.8rem", fontWeight: 600 }}
                        >
                          {lec.course_name}
                        </Typography>
                        {lec.Lecturers?.length > 0 && (
                          <Typography
                            variant="caption"
                            sx={{ display: "block", lineHeight: 1.4 }}
                          >
                            {lec.Lecturers.map((l) => l.name).join(", ")}
                          </Typography>
                        )}
                        {lec.Room?.room_name && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ lineHeight: 1.4 }}
                          >
                            {lec.Room.room_name}
                          </Typography>
                        )}
                      </Box>
                    ))
                  ) : (
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ textAlign: "center", width: "100%" }}
                    >
                      —
                    </Typography>
                  )}
                </Box>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  )
);



/* ------------------------------------------------------------------ */
/* main scheduler component                                           */
/* ------------------------------------------------------------------ */

function SchedulerInner() {
  const theme = useTheme();
  const { stages, loading: stagesLoading } = useStages();

  /* state */
  const [stage, setStage] = useState(1); // numeric StageId
  const [weekDate, setWeekDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [viewType, setViewType] = useState(0); // 0 grid | 1 timeline
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [drawer, setDrawer] = useState(false);

  /* week label */
  const weekRange = useMemo(() => {
    const s = startOfWeek(weekDate, { weekStartsOn: 0 });
    const e = endOfWeek(weekDate, { weekStartsOn: 0 });
    return `${format(s, "yyyy/MM/dd")} - ${format(e, "yyyy/MM/dd")}`;
  }, [weekDate]);

  /* lectures query */
  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["lectures", stage, weekDate],
    queryFn: async () => {
      const start = format(startOfWeek(weekDate), "yyyy-MM-dd");
      const end = format(endOfWeek(weekDate), "yyyy-MM-dd");
      const res = await api.get("/lectures", {
        params: { StageId: stage, start, end },
      });
      return res.data?.data ?? res.data;
    },
    staleTime: 0,
  });

  /* filter & group */
  const grouped = useMemo(() => {
    const byStage = data.filter((l) => l.StageId === stage);
    const afterSearch =
      search.trim() === ""
        ? byStage
        : byStage.filter(
            (l) =>
              l.course_name.toLowerCase().includes(search.toLowerCase()) ||
              l.Lecturers?.some((t) => t.name.toLowerCase().includes(search.toLowerCase())) ||
              l.Room?.room_name?.toLowerCase().includes(search.toLowerCase())
          );

    return DAYS_EN.reduce((acc, d) => {
      acc[d] = afterSearch.filter((l) => l.day_of_week === d);
      return acc;
    }, {});
  }, [data, stage, search]);

  /* helpers */
  const canPrint = data.length > 0 && !isLoading && !isFetching && !isError;

  /* render */
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* print CSS */}
      <GlobalStyles
        styles={{
          "@media print": {
            body: { margin: 0 },
            "body *": { visibility: "hidden" },
            "#print-area, #print-area *": { visibility: "visible" },
            "#print-area": { position: "absolute", inset: 0 },
          },
        }}
      />

      {/* mobile drawer */}
      <SwipeableDrawer
        anchor="right"
        open={drawer}
        onClose={() => setDrawer(false)}
        onOpen={() => setDrawer(true)}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <Box sx={{ width: 260, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography fontWeight={600}>القائمة</Typography>
            <IconButton onClick={() => setDrawer(false)}>
              <Close />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <FormControl fullWidth size="small">
            <InputLabel id="m-stage">المرحلة</InputLabel>
            <Select
              labelId="m-stage"
              value={stage}
              label="المرحلة"
              onChange={(e) => setStage(Number(e.target.value))}
            >
              {stagesLoading ? (
                <MenuItem disabled>Loading…</MenuItem>
              ) : (
                stages.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <List>
            <ListItem button onClick={() => setWeekDate(new Date())}>
              <ListItemText primary="اليوم" />
            </ListItem>
            <ListItem button onClick={refetch}>
              <ListItemText primary="تحديث" />
            </ListItem>
          </List>
        </Box>
      </SwipeableDrawer>

      {/* page header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, display: "flex", alignItems: "center" }}>
          <EventNote sx={{ mr: 1 }} />
          جدول المحاضرات الأسبوعي
        </Typography>
        <Typography color="text.secondary">
          {stages.find((s) => s.id === stage)?.name || "—"} | {weekRange}
        </Typography>
      </Box>

      {/* toolbar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.light, 0.05),
          border: 1,
          borderColor: "divider",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* mobile menu */}
          <Grid item sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton onClick={() => setDrawer(true)}>
              <MenuIcon />
            </IconButton>
          </Grid>

          {/* week nav */}
          <Grid item>
            <Stack direction="row" spacing={1} alignItems="center">
              <ActionButton icon={<ChevronLeft />} label="السابق" onClick={() => setWeekDate(addWeeks(weekDate, -1))} />
              <IconButton
                color="primary"
                sx={{ border: 2, borderColor: "primary.main", bgcolor: "background.paper" }}
                onClick={() => setWeekDate(new Date())}
              >
                <CalendarMonth />
              </IconButton>
              <ActionButton icon={<ChevronRight />} label="التالي" onClick={() => setWeekDate(addWeeks(weekDate, 1))} />
            </Stack>
          </Grid>

          {/* search */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="بحث…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
              sx={{ bgcolor: "background.paper", borderRadius: 2 }}
            />
          </Grid>

          {/* stage select (desktop) */}
          <Grid item sx={{ flexGrow: 1, display: { xs: "none", md: "block" } }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="d-stage">المرحلة</InputLabel>
              <Select
                labelId="d-stage"
                value={stage}
                label="المرحلة"
                onChange={(e) => setStage(Number(e.target.value))}
              >
                {stagesLoading ? (
                  <MenuItem disabled>Loading…</MenuItem>
                ) : (
                  stages.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* refresh & print */}
          <Grid item>
            <Stack direction="row" spacing={1}>
              <ActionButton icon={<Download />} label="طباعة" disabled={!canPrint} onClick={() => window.print()} />
              <ActionButton icon={<Refresh />} label="تحديث" onClick={refetch} color="info" />
              <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
                <FilterList />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* filter pop-menu (placeholder only) */}
      <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={() => setFilterAnchor(null)}>
        <MenuItem disabled>فلترة (قريباً)</MenuItem>
      </Menu>

      {/* tab view */}
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={viewType} onChange={(_, v) => setViewType(v)} indicatorColor="primary">
          <ViewTab icon={<GridView />} label="شبكة" />
          <ViewTab icon={<ViewTimeline />} label="جدول زمني" />
        </Tabs>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          حدث خطأ أثناء جلب البيانات
        </Alert>
      )}

      {viewType === 0 ? (
        <WeekGrid grouped={grouped} loading={isLoading || isFetching} />
      ) : (
        <TimelineView grouped={grouped} loading={isLoading || isFetching} />
      )}

      {/* hidden printable markup */}
      <Box id="print-area" sx={{ position: "absolute", top: 0, left: -9999 }}>
        <PrintableWeek grouped={grouped} weekRange={weekRange} stageName={stages.find((s) => s.id === stage)?.name || "—"} />
      </Box>
    </Container>
  );
}

/* ------------------------------------------------------------------ */
/* react-query provider wrapper                                       */
/* ------------------------------------------------------------------ */

const queryClient = new QueryClient();

export default function ModernWeeklySchedule() {
  return (
    <QueryClientProvider client={queryClient}>
      <SchedulerInner />
    </QueryClientProvider>
  );
}
