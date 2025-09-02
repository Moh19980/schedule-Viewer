/*********************************************************************
 *  ModernWeeklySchedule.jsx (fixed)
 *  – Weekly scheduler with grid & timeline + printable view
 *  – Safe with optional day/time, correct API params, solid layout
 *********************************************************************/

import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
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
import { api } from "../api";

/* ------------------------------------------------------------------ */
/* constants & helpers                                                 */
/* ------------------------------------------------------------------ */

const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const UNSCHEDULED_KEY = "Unscheduled";
const UNSCHEDULED_AR = "غير مُجدول";

// HH:MM slots
const generateTimeSlots = (startTime, endTime, intervalMin) => {
  const slots = [];
  let cur = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  while (cur <= end) {
    slots.push(cur.toTimeString().slice(0, 5));
    cur = new Date(cur.getTime() + intervalMin * 60_000);
  }
  return slots;
};
const TIME_SLOTS = generateTimeSlots("08:30", "16:30", 60);

const lc = (v) => (v ?? "").toString().toLowerCase();
const toHM = (v) => (v ? v.slice(0, 5) : "—");
const byStartTime = (a, b) => {
  const aa = a?.start_time ?? "99:99";
  const bb = b?.start_time ?? "99:99";
  return aa.localeCompare(bb);
};

/* ------------------------------------------------------------------ */
/* fetch stages                                                        */
/* ------------------------------------------------------------------ */

const useStages = () => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/stages");
        setStages(res.data || []);
      } catch (e) {
        console.error("Error fetching stages:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return { stages, loading };
};

/* ------------------------------------------------------------------ */
/* tiny UI helpers                                                     */
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
  transition: "all .2s",
  "&:hover": {
    boxShadow: "0 3px 12px rgba(0,0,0,0.15)",
    transform: "translateY(-2px)",
  },
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

const EmptyDay = ({ label = "لا توجد محاضرات مجدولة" }) => (
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
    <Typography color="text.secondary">{label}</Typography>
  </Box>
);

/* ------------------------------------------------------------------ */
/* card item                                                           */
/* ------------------------------------------------------------------ */

const LectureItem = ({ lecture, idx }) => {
  const palette = ["primary", "secondary", "success", "warning", "info"];
  const color = palette[idx % palette.length];
  return (
    <LectureCard color={color}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography fontWeight={600}>
          {lecture?.course_name ?? "—"}
        </Typography>
        <ColorCircle color={color} />
      </Box>

      {(lecture?.start_time || lecture?.end_time) && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.25 }}>
          <AccessTime sx={{ fontSize: 15 }} />
          <Typography variant="caption">
            {toHM(lecture?.start_time)} – {toHM(lecture?.end_time)}
          </Typography>
        </Stack>
      )}

      {lecture?.Room?.room_name && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.25 }}>
          <Room sx={{ fontSize: 15 }} />
          <Typography variant="caption">{lecture.Room.room_name}</Typography>
        </Stack>
      )}

      {Array.isArray(lecture?.Lecturers) && lecture.Lecturers.length > 0 && (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Person sx={{ fontSize: 15 }} />
          <Typography variant="caption" noWrap>
            {lecture.Lecturers.map((l) => l?.name).filter(Boolean).join(", ")}
          </Typography>
        </Stack>
      )}
    </LectureCard>
  );
};

/* ------------------------------------------------------------------ */
/* grid view (5 days + Unscheduled)                                   */
/* ------------------------------------------------------------------ */

const WeekGrid = ({ grouped, loading }) => {
  const columns = [...DAYS_EN, UNSCHEDULED_KEY];
  const headersAR = [...DAYS_AR, UNSCHEDULED_AR];

  if (loading) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" },
          gap: 2,
        }}
      >
        {columns.map((_, i) => (
          <Skeleton key={i} variant="rectangular" sx={{ height: 420, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" },
        gap: 2,
      }}
    >
      {columns.map((key, i) => {
        const dayLectures = [...(grouped[key] || [])].sort(byStartTime);
        return (
          <Paper
            key={key}
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
              {headersAR[i]}
            </Typography>

            {dayLectures.length ? (
              dayLectures.map((lec, idx) => <LectureItem key={lec.id ?? idx} lecture={lec} idx={idx} />)
            ) : (
              <EmptyDay />
            )}
          </Paper>
        );
      })}
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* timeline view                                                       */
/* ------------------------------------------------------------------ */

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
              const cell =
                grouped[d]?.filter((l) => l?.start_time && toHM(l.start_time) === t) || [];
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
                    cell.map((lec, idx) => (
                      <Typography variant="caption" key={(lec.id ?? "") + idx} display="block">
                        {lec.course_name ?? "—"}
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

      {/* Unscheduled note */}
      {Array.isArray(grouped[UNSCHEDULED_KEY]) && grouped[UNSCHEDULED_KEY].length > 0 && (
        <Box sx={{ mt: 2, p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{UNSCHEDULED_AR}</Typography>
          {grouped[UNSCHEDULED_KEY].map((lec, idx) => (
            <Typography key={(lec.id ?? "") + idx} variant="caption" display="block">
              {lec.course_name ?? "—"}
            </Typography>
          ))}
        </Box>
      )}
    </Paper>
  );
};

/* ------------------------------------------------------------------ */
/* printable                                                          */
/* ------------------------------------------------------------------ */

const PrintableWeek = React.forwardRef(({ grouped, stageName, weekRange }, ref) => (
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
    <Typography variant="h5" fontWeight={700}>
      {`جدول محاضرات ${stageName}`}
    </Typography>
    <Typography variant="subtitle1" color="text.secondary">
      {weekRange}
    </Typography>

    {/* main table (5 days) */}
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
      <Box sx={{ bgcolor: "#1976d2", color: "#fff", p: 1, fontWeight: 600 }}>
        الوقت
      </Box>
      {DAYS_AR.map((d) => (
        <Box key={d} sx={{ bgcolor: "#1976d2", color: "#fff", p: 1, fontWeight: 600 }}>
          {d}
        </Box>
      ))}

      {TIME_SLOTS.map((t) => (
        <React.Fragment key={t}>
          <Box sx={{ p: 1, bgcolor: "#f5f5f5", textAlign: "center", fontWeight: 500 }}>
            {t}
          </Box>

          {DAYS_EN.map((d) => {
            const lectures =
              grouped[d]?.filter(
                (l) => l?.start_time && l?.end_time && toHM(l.start_time) <= t && toHM(l.end_time) >= t
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
                  lectures.map((lec, idx) => (
                    <Box
                      key={(lec.id ?? "") + idx}
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
                      <Typography variant="subtitle2" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                        {lec.course_name ?? "—"}
                      </Typography>
                      {Array.isArray(lec?.Lecturers) && lec.Lecturers.length > 0 && (
                        <Typography variant="caption" sx={{ display: "block", lineHeight: 1.4 }}>
                          {lec.Lecturers.map((l) => l?.name).filter(Boolean).join(", ")}
                        </Typography>
                      )}
                      {lec?.Room?.room_name && (
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                          {lec.Room.room_name}
                        </Typography>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption" color="text.disabled" sx={{ textAlign: "center", width: "100%" }}>
                    —
                  </Typography>
                )}
              </Box>
            );
          })}
        </React.Fragment>
      ))}
    </Box>

    {/* unscheduled list */}
    {Array.isArray(grouped[UNSCHEDULED_KEY]) && grouped[UNSCHEDULED_KEY].length > 0 && (
      <Box sx={{ mt: 3, textAlign: "left" }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          {UNSCHEDULED_AR}
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
          {grouped[UNSCHEDULED_KEY].map((lec, idx) => (
            <Box key={(lec.id ?? "") + idx} sx={{ p: 1, border: "1px dashed #ccc", borderRadius: 1 }}>
              <Typography variant="body2">{lec?.course_name ?? "—"}</Typography>
              {Array.isArray(lec?.Lecturers) && lec.Lecturers.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {lec.Lecturers.map((l) => l?.name).filter(Boolean).join(", ")}
                </Typography>
              )}
              {lec?.Room?.room_name && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  {lec.Room.room_name}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    )}
  </Box>
));

/* ------------------------------------------------------------------ */
/* main scheduler                                                      */
/* ------------------------------------------------------------------ */

function SchedulerInner() {
  const theme = useTheme();
  const { stages, loading: stagesLoading } = useStages();

  const [stage, setStage] = useState(1);
  const [weekDate, setWeekDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [viewType, setViewType] = useState(0); // 0 grid | 1 timeline
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [drawer, setDrawer] = useState(false);

  const weekRange = useMemo(() => {
    const s = startOfWeek(weekDate, { weekStartsOn: 0 });
    const e = endOfWeek(weekDate, { weekStartsOn: 0 });
    return `${format(s, "yyyy/MM/dd")} - ${format(e, "yyyy/MM/dd")}`;
  }, [weekDate]);

  // Correct query param names
  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["lectures", stage, weekDate],
    queryFn: async () => {
      const s = format(startOfWeek(weekDate, { weekStartsOn: 0 }), "yyyy-MM-dd");
      const e = format(endOfWeek(weekDate, { weekStartsOn: 0 }), "yyyy-MM-dd");
      const res = await api.get("/lectures", {
        params: { stage_id: stage, start_date: s, end_date: e },
      });
      const payload = res.data;
      const items = Array.isArray(payload) ? payload : payload?.data ?? [];
      return items;
    },
    staleTime: 0,
  });

  // group by day with an extra "Unscheduled" bucket
  const grouped = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const byStage = list.filter(
      (l) => l?.StageId === stage || l?.Stage?.id === stage
    );

    const afterSearch =
      search.trim() === ""
        ? byStage
        : byStage.filter(
            (l) =>
              lc(l?.course_name).includes(lc(search)) ||
              (Array.isArray(l?.Lecturers) &&
                l.Lecturers.some((t) => lc(t?.name).includes(lc(search)))) ||
              lc(l?.Room?.room_name).includes(lc(search))
          );

    const buckets = { [UNSCHEDULED_KEY]: [] };
    DAYS_EN.forEach((d) => (buckets[d] = []));

    afterSearch.forEach((l) => {
      const day = l?.day_of_week;
      if (day && DAYS_EN.includes(day)) {
        buckets[day].push(l);
      } else {
        buckets[UNSCHEDULED_KEY].push(l);
      }
    });

    return buckets;
  }, [data, stage, search]);

  const canPrint = (data?.length ?? 0) > 0 && !isLoading && !isFetching && !isError;

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
                (stages || []).map((s) => (
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

      {/* header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, display: "flex", alignItems: "center" }}>
          <EventNote sx={{ mr: 1 }} />
          جدول المحاضرات الأسبوعي
        </Typography>
        <Typography color="text.secondary">
          {(stages || []).find((s) => s.id === stage)?.name || "—"} | {weekRange}
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
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          {/* mobile menu */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton onClick={() => setDrawer(true)}>
              <MenuIcon />
            </IconButton>
          </Box>

          {/* week nav */}
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

          {/* search */}
          <TextField
            fullWidth
            size="small"
            placeholder="بحث…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
            sx={{ bgcolor: "background.paper", borderRadius: 2, maxWidth: 420 }}
          />

          {/* stage select (desktop) */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "block" } }} />
          <FormControl size="small" sx={{ minWidth: 160, display: { xs: "none", md: "inline-flex" } }}>
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
                (stages || []).map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* actions */}
          <Stack direction="row" spacing={1}>
            <ActionButton icon={<Download />} label="طباعة" disabled={!canPrint} onClick={() => window.print()} />
            <ActionButton icon={<Refresh />} label="تحديث" onClick={refetch} color="info" />
            <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
              <FilterList />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* filter menu (placeholder) */}
      <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={() => setFilterAnchor(null)}>
        <MenuItem disabled>فلترة (قريباً)</MenuItem>
      </Menu>

      {/* tabs */}
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

      {/* hidden printable area */}
      <Box id="print-area" sx={{ position: "absolute", top: 0, left: -9999 }}>
        <PrintableWeek
          grouped={grouped}
          weekRange={weekRange}
          stageName={(stages || []).find((s) => s.id === stage)?.name || "—"}
        />
      </Box>
    </Container>
  );
}

/* ------------------------------------------------------------------ */
/* provider wrapper                                                    */
/* ------------------------------------------------------------------ */

const queryClient = new QueryClient();

export default function ModernWeeklySchedule() {
  return (
    <QueryClientProvider client={queryClient}>
      <SchedulerInner />
    </QueryClientProvider>
  );
}
