import { useState } from 'react';
import { Tabs, Tab, Paper, Box, Container, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles'; // For transparent colors

// Import Icons for Tabs
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

// Import your form components
import ScheduleForm from './ScheduleForm';
import AddLecturerForm from './AddLecturerForm';
import AddRoomForm from './AddRoomForm';

// TabPanel component remains useful for structure and accessibility
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}> {/* Responsive padding for content */}
          {children}
        </Box>
      )}
    </div>
  );
}

// Helper function for accessibility props
function a11yProps(index) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

export default function Dashboard() {
  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 3, md: 8 }, mb: 6 }}>
      <Typography
        variant="h3" // Slightly larger and more impactful title
        component="h1"
        gutterBottom
        sx={{
          textAlign: 'center',
          mb: { xs: 3, md: 5 },
          fontWeight: 700, // Bolder title
          letterSpacing: '0.5px', // Adds a bit of refinement
        }}
      >
        Management Hub {/* Changed title for a more "modern" feel */}
      </Typography>

      <Paper
        variant="outlined" // Outlined variant for a cleaner, modern look
        sx={{
          borderRadius: 4, // Slightly more pronounced border radius
          // bgcolor: (theme) => alpha(theme.palette.background.default, 0.5) // Optional: subtle background tint
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            aria-label="Modern dashboard tabs"
            TabIndicatorProps={{
              sx: { display: 'none' } // Hide the default indicator line
            }}
            sx={{
              // Style for the Tabs container itself if needed
            }}
          >
            <Tab
              icon={<EventNoteIcon />}
              iconPosition="start"
              label="Schedule" // Shorter label
              {...a11yProps(0)}
              sx={(theme) => ({
                textTransform: 'none', // More natural casing
                fontWeight: 600,
                fontSize: '0.9rem',
                borderRadius: '20px', // Pill shape
                px: 2.5, // Horizontal padding for the pill
                py: 1,   // Vertical padding for the pill
                mr: 1,   // Margin between tabs
                minHeight: 'auto',
                color: theme.palette.text.secondary,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                '&:not(.Mui-selected):hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.6),
                },
              })}
            />
            <Tab
              icon={<PersonAddAlt1Icon />}
              iconPosition="start"
              label="Lecturers" // Shorter label
              {...a11yProps(1)}
              sx={(theme) => ({
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                borderRadius: '20px',
                px: 2.5,
                py: 1,
                mr: 1,
                minHeight: 'auto',
                color: theme.palette.text.secondary,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                '&:not(.Mui-selected):hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.6),
                },
              })}
            />
            <Tab
              icon={<MeetingRoomIcon />}
              iconPosition="start"
              label="Rooms" // Shorter label
              {...a11yProps(2)}
              sx={(theme) => ({
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                borderRadius: '20px',
                px: 2.5,
                py: 1,
                minHeight: 'auto',
                color: theme.palette.text.secondary,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                '&:not(.Mui-selected):hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.6),
                },
              })}
            />
          </Tabs>
        </Box>

        <TabPanel value={tab} index={0}>
          <ScheduleForm />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <AddLecturerForm />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <AddRoomForm />
        </TabPanel>
      </Paper>
    </Container>
  );
}