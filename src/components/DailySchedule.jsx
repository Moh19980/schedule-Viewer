import React, { useState, useRef, useMemo, forwardRef } from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
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
} from "@mui/icons-material";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import html2pdf from "html2pdf.js";
import { format, addWeeks, startOfWeek, endOfWeek } from "date-fns";
import { api } from "../api";

// Constants
const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const STAGE_OPTIONS = [
  { value: "stage1", label: "المرحلة الأولى" },
  { value: "stage2", label: "المرحلة الثانية" },
  { value: "stage3", label: "المرحلة الثالثة" },
  { value: "stage4", label: "المرحلة الرابعة" },
];
const TIME_SLOTS = ["08:30", "10:30", "12:30", "14:30"];

// Styled components
const StyledTimeSlot = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5),
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  height: "30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const LectureCard = styled(Card)(({ theme, color = "primary" }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  borderLeft: `4px solid ${theme.palette[color].main}`,
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
}));

const ColorCircle = styled(Circle)(({ color, theme }) => ({
  fontSize: "12px",
  color: theme.palette[color].main,
}));

const ViewTab = styled(Tab)(({ theme }) => ({
  minWidth: "100px",
  fontWeight: 600,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

// Helper components
const ActionButton = ({
  icon,
  label,
  color = "primary",
  onClick,
  disabled,
}) => (
  <Button
    variant="outlined"
    color={color}
    startIcon={icon}
    onClick={onClick}
    disabled={disabled}
    size="small"
    sx={{ borderRadius: 2 }}
  >
    {label}
  </Button>
);

const EmptyDay = () => (
  <Box
    sx={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: 2,
      borderRadius: 2,
      bgcolor: "background.paper",
      border: "1px dashed",
      borderColor: "divider",
      minHeight: 120,
    }}
  >
    <Typography variant="body2" color="text.secondary" align="center">
      لا توجد محاضرات مجدولة
    </Typography>
  </Box>
);

// Lecture components
const LectureItem = ({ lecture, colorIndex }) => {
  const colors = ["primary", "secondary", "success", "warning", "info"];
  const color = colors[colorIndex % colors.length];

  return (
    <LectureCard color={color}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          {lecture.course_name}
        </Typography>
        <ColorCircle color={color} />
      </Box>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        <AccessTime fontSize="small" color="action" sx={{ fontSize: 14 }} />
        <Typography variant="caption">
          {`${lecture.start_time.slice(0, 5)} - ${lecture.end_time.slice(
            0,
            5
          )}`}
        </Typography>
      </Stack>

      {lecture.Room?.room_name && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <Room fontSize="small" color="action" sx={{ fontSize: 14 }} />
          <Typography variant="caption">{lecture.Room.room_name}</Typography>
        </Stack>
      )}

      {lecture.Lecturers?.length > 0 && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Person fontSize="small" color="action" sx={{ fontSize: 14 }} />
          <Typography variant="caption" noWrap>
            {lecture.Lecturers.map((l) => l.name).join(", ")}
          </Typography>
        </Stack>
      )}
    </LectureCard>
  );
};

// Weekly calendar grid
const WeekGrid = ({ grouped, isLoading }) => {
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {DAYS_EN.map((_, i) => (
          <Grid item xs={12} sm={6} md={2.4} key={i}>
            <Skeleton
              variant="rectangular"
              height={350}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {DAYS_EN.map((day, i) => {
        const lectures = grouped[day] || [];
        const sortedLectures = [...lectures].sort((a, b) =>
          a.start_time.localeCompare(b.start_time)
        );

        return (
          <Grid item xs={12} sm={6} md={2.4} key={day}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                minHeight: 350,
                bgcolor: alpha("#f5f5f5", 0.5),
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 2, textAlign: "center", color: "primary.dark" }}
              >
                {DAYS_AR[i]}
              </Typography>

              {sortedLectures.length > 0 ? (
                sortedLectures.map((lec, index) => (
                  <LectureItem key={lec.id} lecture={lec} colorIndex={index} />
                ))
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

// Timeline view
const TimelineView = ({ grouped, isLoading }) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  // Colors for days
  const dayColors = [
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.success.light,
    theme.palette.warning.light,
    theme.palette.info.light,
  ];

  return (
    <Paper
      elevation={0}
      sx={{ mt: 2, p: 2, borderRadius: 2, overflowX: "auto" }}
    >
      <Box
        sx={{
          minWidth: 900,
          display: "grid",
          gridTemplateColumns: "80px repeat(5, 1fr)",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", p: 1, fontWeight: 600 }}>الوقت</Box>
        {DAYS_AR.map((day, i) => (
          <Box
            key={day}
            sx={{
              textAlign: "center",
              p: 1,
              fontWeight: 600,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: alpha(dayColors[i], 0.1),
            }}
          >
            {day}
          </Box>
        ))}

        {/* Time slots */}
        {TIME_SLOTS.map((time) => (
          <React.Fragment key={time}>
            <StyledTimeSlot>{time}</StyledTimeSlot>

            {DAYS_EN.map((day, i) => {
              const lectures =
                grouped[day]?.filter((l) => l.start_time.startsWith(time)) ||
                [];

              return (
                <Box
                  key={`${day}-${time}`}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    minHeight: "60px",
                    p: 0.5,
                    bgcolor: lectures.length
                      ? alpha(dayColors[i], 0.05)
                      : "transparent",
                  }}
                >
                  {lectures.length > 0 ? (
                    lectures.map((lec) => (
                      <Box
                        key={lec.id}
                        sx={{
                          p: 1,
                          fontSize: "0.75rem",
                          borderRadius: 1,
                          bgcolor: alpha(dayColors[i], 0.2),
                          mb: 0.5,
                          border: `1px solid ${alpha(dayColors[i], 0.3)}`,
                        }}
                      >
                        <Typography variant="caption" fontWeight={600}>
                          {lec.course_name}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {lec.Room?.room_name || "—"}
                        </Typography>
                        {lec.Lecturers?.length > 0 && (
                          <Typography
                            variant="caption"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            {lec.Lecturers.map((l) => l.name).join(", ")}
                          </Typography>
                        )}
                      </Box>
                    ))
                  ) : (
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "text.disabled",
                      }}
                    >
                      —
                    </Box>
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

// Printable weekly schedule
const PrintableWeek = forwardRef(({ grouped, stageLabel, weekRange }, ref) => (
  <Box
    ref={ref}
    sx={{
      p: 4,
      bgcolor: "#fff",
      direction: "rtl",
      fontFamily: "Cairo, sans-serif",
      width: "297mm",
    }}
  >
    <Box sx={{ mb: 4, textAlign: "center" }}>
      <Typography variant="h5" fontWeight={700}>
        {`جدول محاضرات ${stageLabel}`}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {weekRange}
      </Typography>
    </Box>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "80px repeat(5, 1fr)",
        border: "1px solid #ddd",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#1976d2",
          color: "white",
          p: 1.5,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        الوقت
      </Box>

      {DAYS_AR.map((day, i) => (
        <Box
          key={day}
          sx={{
            bgcolor: "#1976d2",
            color: "white",
            p: 1.5,
            fontWeight: 600,
            textAlign: "center",
            borderLeft: i < 4 ? "1px solid #1565c0" : "none",
          }}
        >
          {day}
        </Box>
      ))}

      {/* Time slots */}
      {TIME_SLOTS.map((time, timeIndex) => (
        <React.Fragment key={time}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: "#f5f5f5",
              borderTop: "1px solid #ddd",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {time}
          </Box>

          {DAYS_EN.map((day, dayIndex) => {
            const lectures =
              grouped[day]?.filter((l) => l.start_time.startsWith(time)) || [];

            return (
              <Box
                key={`${day}-${time}`}
                sx={{
                  p: 1,
                  borderTop: "1px solid #ddd",
                  borderLeft: dayIndex < 4 ? "1px solid #ddd" : "none",
                  minHeight: "70px",
                  bgcolor: timeIndex % 2 === 0 ? "#fff" : "#fafafa",
                }}
              >
                {lectures.length > 0 ? (
                  lectures.map((lec) => (
                    <Box key={lec.id} sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        {lec.course_name}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: "#555" }}>
                        {lec.Lecturers?.map((l) => l.name).join("، ")}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: "#555" }}>
                        {lec.Room?.room_name || "—"}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#aaa",
                    }}
                  >
                    —
                  </Box>
                )}
              </Box>
            );
          })}
        </React.Fragment>
      ))}
    </Box>

    <Box sx={{ mt: 3, textAlign: "center", fontSize: "0.8rem", color: "#777" }}>
      تم إنشاء هذا الجدول آلياً من نظام الجدولة - كلية تكنولوجيا المعلومات
    </Box>
  </Box>
));

// Main component
function SchedulerInner() {
  const theme = useTheme();

  // State
  const [stage, setStage] = useState("stage1");
  const [weekDate, setWeekDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [viewType, setViewType] = useState(0); // 0: Grid, 1: Timeline
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Refs for export
  const printRef = useRef(null);

  // Navigation
  const prevWeek = () => setWeekDate(addWeeks(weekDate, -1));
  const nextWeek = () => setWeekDate(addWeeks(weekDate, 1));
  const goToday = () => setWeekDate(new Date());

  // Format week range
  const weekFormatted = useMemo(() => {
    const start = startOfWeek(weekDate, { weekStartsOn: 0 });
    const end = endOfWeek(weekDate, { weekStartsOn: 0 });
    return `${format(start, "yyyy/MM/dd")} - ${format(end, "yyyy/MM/dd")}`;
  }, [weekDate]);

  // Data fetching
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["lectures", stage, weekDate],
    queryFn: async () => {
      const start = format(
        startOfWeek(weekDate, { weekStartsOn: 0 }),
        "yyyy-MM-dd"
      );
      const end = format(
        endOfWeek(weekDate, { weekStartsOn: 0 }),
        "yyyy-MM-dd"
      );
      const resp = await api.get("/lectures", {
        params: { stage, start, end },
      });
      return resp.data?.data || [];
    },
    staleTime: 300000,
  });

  // Filter and group data
  const grouped = useMemo(() => {
    const filtered = search
      ? data.filter(
          (l) =>
            l.course_name.toLowerCase().includes(search.toLowerCase()) ||
            l.Lecturers?.some((t) =>
              t.name.toLowerCase().includes(search.toLowerCase())
            ) ||
            (l.Room?.room_name &&
              l.Room.room_name.toLowerCase().includes(search.toLowerCase()))
        )
      : data;

    return DAYS_EN.reduce((acc, day) => {
      acc[day] = filtered.filter((l) => l.day_of_week === day);
      return acc;
    }, {});
  }, [data, search]);

  // Export to PDF
  const exportPDF = async () => {
    if (isLoading) return;

    try {
      // Define better options for RTL language support
      const opt = {
        margin: 10,
        filename: `schedule-${stage}-${format(weekDate, "yyyy-MM-dd")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true, // Better text rendering
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape",
          compress: true,
          hotfixes: ["px_scaling"], // Fixes scaling issues
          putOnlyUsedFonts: true,
        },
      };

      await html2pdf().set(opt).from(printRef.current).save();
    } catch (err) {
      console.error("Failed to export PDF:", err);
    }
  };

  // Filter menu
  const openFilterMenu = (event) => setFilterAnchor(event.currentTarget);
  const closeFilterMenu = () => setFilterAnchor(null);

  // Mobile drawer toggle
  const toggleDrawer = (open) => () => setMobileDrawerOpen(open);

  // Get current stage label
  const currentStageLabel = STAGE_OPTIONS.find((s) => s.value === stage)?.label;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Mobile drawer */}
      <SwipeableDrawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              القائمة
            </Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="mobile-stage-label">المرحلة</InputLabel>
            <Select
              labelId="mobile-stage-label"
              value={stage}
              label="المرحلة"
              onChange={(e) => setStage(e.target.value)}
            >
              {STAGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <List>
            <ListItem button onClick={goToday}>
              <ListItemText primary="اليوم" />
            </ListItem>
            <ListItem button onClick={exportPDF}>
              <ListItemText primary="تصدير PDF" />
            </ListItem>
            <ListItem button onClick={refetch}>
              <ListItemText primary="تحديث" />
            </ListItem>
          </List>
        </Box>
      </SwipeableDrawer>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight={800}
          color="primary.main"
          sx={{ mb: 1, display: "flex", alignItems: "center" }}
        >
          <EventNote sx={{ mr: 1.5, fontSize: 32 }} />
          جدول المحاضرات الأسبوعي
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {currentStageLabel} | {weekFormatted}
        </Typography>
      </Box>

      {/* Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.light, 0.05),
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Mobile menu button */}
          <Grid item sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          </Grid>

          {/* Week navigation */}
          <Grid item xs={12} md="auto">
            <Stack direction="row" spacing={1} alignItems="center">
              <ActionButton
                icon={<ChevronLeft />}
                label="السابق"
                onClick={prevWeek}
                color="secondary"
              />
              <IconButton
                color="primary"
                onClick={goToday}
                sx={{
                  border: "2px solid",
                  borderColor: "primary.main",
                  bgcolor: "background.paper",
                }}
              >
                <CalendarMonth />
              </IconButton>
              <ActionButton
                icon={<ChevronRight />}
                label="التالي"
                onClick={nextWeek}
                color="secondary"
              />
            </Stack>
          </Grid>

          {/* Search */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="بحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />,
              }}
              size="small"
              sx={{ bgcolor: "background.paper", borderRadius: 2 }}
            />
          </Grid>

          {/* Stage selection (desktop) */}
          <Grid item md sx={{ display: { xs: "none", md: "block" } }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="stage-select-label">المرحلة</InputLabel>
              <Select
                labelId="stage-select-label"
                value={stage}
                label="المرحلة"
                onChange={(e) => setStage(e.target.value)}
              >
                {STAGE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Actions */}
          <Grid item xs={12} md="auto">
            <Stack
              direction="row"
              spacing={1}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              <ActionButton
                icon={<Download />}
                label="تصدير PDF"
                onClick={exportPDF}
                disabled={isLoading}
              />
           
              <ActionButton
                icon={<Refresh />}
                label="تحديث"
                onClick={() => refetch()}
                color="info"
              />
              <IconButton
                onClick={openFilterMenu}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <FilterList />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Filter menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={closeFilterMenu}
        PaperProps={{
          elevation: 2,
          sx: { width: 200, mt: 1 },
        }}
      >
        <MenuItem onClick={closeFilterMenu}>
          <Typography variant="body2">فلترة حسب الأستاذ</Typography>
        </MenuItem>
        <MenuItem onClick={closeFilterMenu}>
          <Typography variant="body2">فلترة حسب القاعة</Typography>
        </MenuItem>
        <MenuItem onClick={closeFilterMenu}>
          <Typography variant="body2">عرض المواد فقط</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={closeFilterMenu}>
          <Typography variant="body2" color="error">
            إلغاء الفلترة
          </Typography>
        </MenuItem>
      </Menu>

      {/* View type tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={viewType}
          onChange={(_, val) => setViewType(val)}
          aria-label="view type tabs"
          indicatorColor="primary"
        >
          <ViewTab icon={<GridViewIcon />} label="شبكة" />
          <ViewTab icon={<ViewTimelineIcon />} label="جدول زمني" />
        </Tabs>
      </Box>

      {/* Error state */}
      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              إعادة المحاولة
            </Button>
          }
        >
          حدث خطأ أثناء جلب البيانات، يرجى المحاولة مرة أخرى.
        </Alert>
      )}

      {/* Content based on view type */}
      {viewType === 0 ? (
        <WeekGrid grouped={grouped} isLoading={isLoading} />
      ) : (
        <TimelineView grouped={grouped} isLoading={isLoading} />
      )}

      {/* Hidden printable element */}
      <Box sx={{ position: "absolute", left: "-9999px", top: 0 }}>
        <PrintableWeek
          ref={printRef}
          grouped={grouped}
          stageLabel={currentStageLabel}
          weekRange={weekFormatted}
        />
      </Box>
    </Container>
  );
}

// Missing icons (not included in the imports, adding placeholders)
const GridViewIcon = () => <Grid4x4 />;
const ViewTimelineIcon = () => <ViewTimeline />;
const Grid4x4 = () => <Box component="span">□</Box>;
const ViewTimeline = () => <Box component="span">≡</Box>;

// Provider wrapper
const queryClient = new QueryClient();

export default function ModernWeeklySchedule() {
  return (
    <QueryClientProvider client={queryClient}>
      <SchedulerInner />
    </QueryClientProvider>
  );
}
