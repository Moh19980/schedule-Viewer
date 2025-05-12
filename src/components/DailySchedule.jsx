/*********************************************************************
 *  ModernWeeklySchedule.jsx
 *  – Fully-featured weekly scheduler with printable timetable
 *  – No external print library (uses window.print)
 *  – Ensures fresh data are fetched before printing
 *********************************************************************/

import React, { useState, useMemo } from 'react';
import {
  Container, Box, Typography, Button, Card, Grid, Stack, IconButton,
  TextField, Menu, MenuItem, Paper, Divider, Select, FormControl,
  InputLabel, alpha, useTheme, Alert, Skeleton, Tabs, Tab, SwipeableDrawer,
  List, ListItem, ListItemText, GlobalStyles,
} from '@mui/material';
import {
  ChevronLeft, ChevronRight, CalendarMonth, Download, Search, Refresh,
  FilterList, Room, Person, AccessTime, Circle, EventNote, Close,
  Menu as MenuIcon, GridView, ViewTimeline,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  QueryClient, QueryClientProvider, useQuery,
} from '@tanstack/react-query';
import { format, addWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { api } from '../api';            // <-- change to your axios instance path

/* ------------------------------------------------------------------
   Constants
------------------------------------------------------------------ */
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

const STAGE_OPTIONS = [
  { value: 'stage1', label: 'المرحلة الأولى' },
  { value: 'stage2', label: 'المرحلة الثانية' },
  { value: 'stage3', label: 'المرحلة الثالثة' },
  { value: 'stage4', label: 'المرحلة الرابعة' },
];
/**
 * Generates time slots from start time to end time with a specified interval.
 * 
/**
 * Generates time slots from start time to end time with a specified interval.
 * @param {string} startTime - Starting time in "HH:mm" format.
 * @param {string} endTime - Ending time in "HH:mm" format.
 * @param {number} interval - Interval in minutes.
 * @returns {string[]} Array of time slots in "HH:mm" format.
 */
const generateTimeSlots = (startTime, endTime, interval) => {
  const slots = [];
  let current = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);

  while (current <= end) {
    slots.push(current.toTimeString().slice(0, 5));
    current = new Date(current.getTime() + interval * 60000);
  }

  return slots;
};

// Example usage: Generates slots from 08:30 to 20:30 with a 60-minute interval
const TIME_SLOTS = generateTimeSlots("08:30", "20:30", 60);
console.log(TIME_SLOTS);



/* ------------------------------------------------------------------
   Styled helpers
------------------------------------------------------------------ */
const StyledTimeSlot = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5),
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const LectureCard = styled(Card)(({ theme, color = 'primary' }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  borderLeft: `4px solid ${theme.palette[color].main}`,
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'pointer',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
}));

const ColorCircle = styled(Circle)(({ color, theme }) => ({
  fontSize: 12,
  color: theme.palette[color].main,
}));

const ViewTab = styled(Tab)(() => ({ minWidth: 100, fontWeight: 600 }));

/* ------------------------------------------------------------------
   Reusable tiny button
------------------------------------------------------------------ */
const ActionButton = ({ icon, label, color = 'primary', onClick, disabled }) => (
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

/* ------------------------------------------------------------------
   Week-grid sub-components
------------------------------------------------------------------ */
const EmptyDay = () => (
  <Box sx={{
    height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px dashed',
    borderColor: 'divider', minHeight: 120,
  }}>
    <Typography variant="body2" color="text.secondary">لا توجد محاضرات مجدولة</Typography>
  </Box>
);

const LectureItem = ({ lecture, colorIndex }) => {
  const colors = ['primary', 'secondary', 'success', 'warning', 'info'];
  const color = colors[colorIndex % colors.length];
  return (
    <LectureCard color={color}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={600}>{lecture.course_name}</Typography>
        <ColorCircle color={color} />
      </Box>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        <AccessTime fontSize="small" color="action" sx={{ fontSize: 14 }} />
        <Typography variant="caption">
          {lecture.start_time.slice(0, 5)} - {lecture.end_time.slice(0, 5)}
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
            {lecture.Lecturers.map((l) => l.name).join(', ')}
          </Typography>
        </Stack>
      )}
    </LectureCard>
  );
};

/* ------------------------------------------------------------------
   Grid view
------------------------------------------------------------------ */
const WeekGrid = ({ grouped, isLoading }) => {
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {DAYS_EN.map((_, i) => (
          <Grid item xs={12} sm={6} md={2.4} key={i}>
            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }
  return (
    <Grid container spacing={2}>
      {DAYS_EN.map((day, i) => {
        const sorted = [...(grouped[day] || [])].sort((a, b) =>
          a.start_time.localeCompare(b.start_time)
        );
        return (
          <Grid item xs={12} sm={6} md={2.4} key={day}>
            <Paper elevation={0} sx={{
              p: 2, borderRadius: 2, minHeight: 350,
              bgcolor: alpha('#f5f5f5', 0.5), border: 1, borderColor: 'divider',
            }}>
              <Typography
                variant="subtitle1" fontWeight={700}
                sx={{ mb: 2, textAlign: 'center', color: 'primary.dark' }}
              >
                {DAYS_AR[i]}
              </Typography>

              {sorted.length
                ? sorted.map((lec, idx) => <LectureItem key={lec.id} lecture={lec} colorIndex={idx} />)
                : <EmptyDay />}
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

/* ------------------------------------------------------------------
   Timeline view
------------------------------------------------------------------ */
const TimelineView = ({ grouped, isLoading }) => {
  const theme = useTheme();
  if (isLoading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  const dayColors = [
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.success.light,
    theme.palette.warning.light,
    theme.palette.info.light,
  ];

  return (
    <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 2, overflowX: 'auto' }}>
      <Box sx={{ minWidth: 900, display: 'grid', gridTemplateColumns: '80px repeat(5, 1fr)' }}>
        {/* header row */}
        <Box sx={{ textAlign: 'center', p: 1, fontWeight: 600 }}>الوقت</Box>
        {DAYS_AR.map((day, i) => (
          <Box key={day} sx={{
            textAlign: 'center', p: 1, fontWeight: 600,
            borderBottom: 1, borderColor: 'divider', bgcolor: alpha(dayColors[i], 0.1),
          }}>{day}</Box>
        ))}

        {/* body rows */}
        {TIME_SLOTS.map((time) => (
          <React.Fragment key={time}>
            <StyledTimeSlot>{time}</StyledTimeSlot>
            {DAYS_EN.map((day, i) => {
              const cellLectures = grouped[day]?.filter((l) =>
                l.start_time.startsWith(time)) || [];
              return (
                <Box key={`${day}-${time}`} sx={{
                  borderBottom: 1, borderColor: 'divider',
                  minHeight: 60, p: 0.5,
                  bgcolor: cellLectures.length ? alpha(dayColors[i], 0.05) : 'transparent',
                }}>
                  {cellLectures.length ? cellLectures.map((lec) => (
                    <Box key={lec.id} sx={{
                      p: 1, fontSize: '0.75rem', borderRadius: 1,
                      bgcolor: alpha(dayColors[i], 0.2), mb: 0.5,
                      border: `1px solid ${alpha(dayColors[i], 0.3)}`,
                    }}>
                      <Typography variant="caption" fontWeight={600}>{lec.course_name}</Typography>
                      <Typography variant="caption" display="block">
                        {lec.Room?.room_name || '—'}
                      </Typography>
                      {lec.Lecturers?.length > 0 && (
                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                          {lec.Lecturers.map((l) => l.name).join(', ')}
                        </Typography>
                      )}
                    </Box>
                  )) : (
                    <Box sx={{
                      height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'text.disabled',
                    }}>—</Box>
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

/* ------------------------------------------------------------------
   Printable component
------------------------------------------------------------------ */
const PrintableWeek = React.forwardRef(({ grouped, stageLabel, weekRange }, ref) => (
  <Box ref={ref} sx={{
    p: 4, bgcolor: '#fff', fontFamily: 'Arial, sans-serif',
    width: '297mm', margin: '0 auto', textAlign: 'center'
  }}>
    <Typography variant="h5" fontWeight={700}>
      {`جدول محاضرات ${stageLabel}`}
    </Typography>
    <Typography variant="subtitle1" color="text.secondary">
      {weekRange}
    </Typography>

    <Box sx={{
      display: 'grid', gridTemplateColumns: `80px repeat(5, 1fr)`,
      border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden', marginTop: 3
    }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#1976d2', color: '#fff', p: 1.5, fontWeight: 600 }}>
        الوقت
      </Box>
      {DAYS_AR.map((day) => (
        <Box key={day} sx={{
          bgcolor: '#1976d2', color: '#fff', p: 1.5, fontWeight: 600, borderLeft: '1px solid #1565c0'
        }}>
          {day}
        </Box>
      ))}

      {/* Time Slots */}
      {TIME_SLOTS.map((time) => (
        <React.Fragment key={time}>
          <Box sx={{
            p: 1.5, bgcolor: '#f5f5f5', borderTop: '1px solid #ddd',
            fontWeight: 500, textAlign: 'center'
          }}>
            {time}
          </Box>
          {DAYS_EN.map((day) => {
            const cellLectures = grouped[day]?.filter((l) => 
              l.start_time <= time && l.end_time >= time) || [];
            return (
              <Box key={`${day}-${time}`} sx={{
                p: 1, borderTop: '1px solid #ddd', minHeight: 50,
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
              }}>
                {cellLectures.length > 0 ? (
                  cellLectures.map((lec) => (
                    <Box key={lec.id} sx={{ textAlign: 'center', mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {lec.course_name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#555' }}>
                        {lec.Lecturers?.map((l) => l.name).join(', ')}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#555' }}>
                        {lec.Room?.room_name || '—'}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ color: '#aaa' }}>—</Typography>
                )}
              </Box>
            );
          })}
        </React.Fragment>
      ))}
    </Box>
  </Box>
));


/* ------------------------------------------------------------------
   Main scheduler component
------------------------------------------------------------------ */
function SchedulerInner() {
  const theme = useTheme();

  /* local state */
  const [stage, setStage] = useState('stage1');
  const [weekDate, setWeekDate] = useState(new Date());
  const [search, setSearch] = useState('');
  const [viewType, setViewType] = useState(0);   // 0 grid, 1 timeline
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);


  /* week helpers */
  const weekFormatted = useMemo(() => {
    const s = startOfWeek(weekDate, { weekStartsOn: 0 });
    const e = endOfWeek(weekDate,   { weekStartsOn: 0 });
    return `${format(s,'yyyy/MM/dd')} - ${format(e,'yyyy/MM/dd')}`;
  }, [weekDate]);

  /* React Query */
  const {
    data = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['lectures', stage, weekDate],
    queryFn: async () => {
      const start = format(startOfWeek(weekDate, { weekStartsOn: 0 }), 'yyyy-MM-dd');
      const end   = format(endOfWeek(weekDate,   { weekStartsOn: 0 }), 'yyyy-MM-dd');
      const res   = await api.get('/lectures', { params: { stage, start, end } });
      return res.data?.data || [];
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  /* group + search */
  const grouped = useMemo(() => {
    const filt = search
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
    return DAYS_EN.reduce((acc, d) => {
      acc[d] = filt.filter((l) => l.day_of_week === d);
      return acc;
    }, {});
  }, [data, search]);

  /* async print – fetch fresh first */
const handlePrint = () => {
  if (data.length > 0) {
    window.print();
  } else {
    alert('لا توجد محاضرات لهذه المرحلة / الأسبوع.');
  }
};

  const canPrint = !isLoading && !isFetching && !isError && data.length > 0;

  /* helpers for navigation, menus */
  const prevWeek = () => setWeekDate(addWeeks(weekDate, -1));
  const nextWeek = () => setWeekDate(addWeeks(weekDate,  1));
  const goToday  = () => setWeekDate(new Date());
  const openFilterMenu  = (e) => setFilterAnchor(e.currentTarget);
  const closeFilterMenu = () => setFilterAnchor(null);
  const toggleDrawer    = (o) => () => setMobileDrawerOpen(o);

  const currentStageLabel = STAGE_OPTIONS.find((s) => s.value === stage)?.label;

  /* ------------------------------------------------------------------
     JSX
  ------------------------------------------------------------------ */
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* print-only visibility rules */}
      <GlobalStyles styles={{
        '@media print': {
          body: { margin: 0 },
          'body *': { visibility: 'hidden' },
          '#print-area, #print-area *': { visibility: 'visible' },
          '#print-area': { position: 'absolute', inset: 0 },
          '@page': { margin: '12mm' },
        },
      }} />

      {/* Mobile drawer (filters) */}
      <SwipeableDrawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>القائمة</Typography>
            <IconButton onClick={toggleDrawer(false)}><Close /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="mobile-stage">المرحلة</InputLabel>
            <Select
              labelId="mobile-stage"
              value={stage}
              label="المرحلة"
              onChange={(e) => setStage(e.target.value)}
            >
              {STAGE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <List>
            <ListItem button onClick={goToday}><ListItemText primary="اليوم" /></ListItem>
            <ListItem button onClick={refetch}><ListItemText primary="تحديث" /></ListItem>
          </List>
        </Box>
      </SwipeableDrawer>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          <EventNote sx={{ mr: 1.5, fontSize: 32 }} />
          جدول المحاضرات الأسبوعي
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {currentStageLabel} | {weekFormatted}
        </Typography>
      </Box>

      {/* Toolbar */}
      <Paper elevation={0} sx={{
        p: 2, mb: 3, borderRadius: 3,
        bgcolor: alpha(theme.palette.primary.light, 0.05),
        border: 1, borderColor: 'divider',
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item sx={{ display: { xs: 'block', md: 'none' } }}>
            <IconButton onClick={toggleDrawer(true)}><MenuIcon /></IconButton>
          </Grid>

          {/* week nav */}
          <Grid item xs={12} md="auto">
            <Stack direction="row" spacing={1} alignItems="center">
              <ActionButton icon={<ChevronLeft />} label="السابق" onClick={prevWeek} color="secondary" />
              <IconButton color="primary" onClick={goToday} sx={{ border: 2, borderColor: 'primary.main', bgcolor: 'background.paper' }}>
                <CalendarMonth />
              </IconButton>
              <ActionButton icon={<ChevronRight />} label="التالي" onClick={nextWeek} color="secondary" />
            </Stack>
          </Grid>

          {/* search */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth size="small" placeholder="بحث..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <Search color="action" sx={{ mr: 1 }} /> }}
              sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
            />
          </Grid>

          {/* stage select (desktop) */}
          <Grid item md sx={{ display: { xs: 'none', md: 'block' } }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="stage-sel">المرحلة</InputLabel>
              <Select
                labelId="stage-sel"
                value={stage}
                label="المرحلة"
                onChange={(e) => setStage(e.target.value)}
              >
                {STAGE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* action buttons */}
          <Grid item xs={12} md="auto">
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <ActionButton icon={<Download />} label="طباعة" onClick={handlePrint} disabled={!canPrint} />
              <ActionButton icon={<Refresh  />} label="تحديث" onClick={refetch} color="info" />
              <IconButton onClick={openFilterMenu} sx={{ border: 1, borderColor: 'divider' }}>
                <FilterList />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* filter menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={closeFilterMenu}
        PaperProps={{ elevation: 2, sx: { width: 200, mt: 1 } }}
      >
        <MenuItem onClick={closeFilterMenu}><Typography variant="body2">فلترة حسب الأستاذ</Typography></MenuItem>
        <MenuItem onClick={closeFilterMenu}><Typography variant="body2">فلترة حسب القاعة</Typography></MenuItem>
        <Divider />
        <MenuItem onClick={closeFilterMenu}><Typography variant="body2" color="error">إلغاء الفلترة</Typography></MenuItem>
      </Menu>

      {/* view tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={viewType} onChange={(_, v) => setViewType(v)} indicatorColor="primary">
          <ViewTab icon={<GridView />}      label="شبكة" />
          <ViewTab icon={<ViewTimeline />} label="جدول زمني" />
        </Tabs>
      </Box>

      {/* error state */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}
          action={<Button color="inherit" size="small" onClick={refetch}>إعادة المحاولة</Button>}
        >
          حدث خطأ أثناء جلب البيانات.
        </Alert>
      )}

      {/* main view */}
      {viewType === 0
        ? <WeekGrid     grouped={grouped} isLoading={isLoading || isFetching} />
        : <TimelineView grouped={grouped} isLoading={isLoading || isFetching} />}

      {/* hidden printable node */}
      <Box id="print-area" sx={{ position: 'absolute', top: 0, left: '-10000px' }}>
        <PrintableWeek
          grouped={grouped}
          stageLabel={currentStageLabel}
          weekRange={weekFormatted}
        />
      </Box>
    </Container>
  );
}

/* ------------------------------------------------------------------
   Mount with React-Query provider
------------------------------------------------------------------ */
const queryClient = new QueryClient();

export default function ModernWeeklySchedule() {
  return (
    <QueryClientProvider client={queryClient}>
      <SchedulerInner />
    </QueryClientProvider>
  );
}
