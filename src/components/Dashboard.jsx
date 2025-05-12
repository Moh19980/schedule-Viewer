import { useState } from 'react';
import { Tabs, Tab, Paper, Box, Container, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { keyframes } from '@emotion/react';

// Import Icons
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ListAltIcon from "@mui/icons-material/ListAlt";

// Form Components
import ScheduleForm from './ScheduleForm';
import AddLecturerForm from './AddLecturerForm';
import AddRoomForm from './AddRoomForm';
import AllLecturere from './AllLecturere';

// Animation for tab transition
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

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
        <Box sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          animation: `${fadeIn} 0.3s ease-out`
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

export default function Dashboard() {
  const [tab, setTab] = useState(0);
  const theme = useTheme();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ 
      mt: { xs: 3, md: 8 }, 
      mb: 6,
      transition: 'all 0.3s ease'
    }}>
      <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.5px',
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1.5,
            [theme.breakpoints.down('md')]: {
              fontSize: '2.5rem'
            }
          }}
        >
          Management Hub
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: 'text.secondary',
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Manage schedules, lecturers, and rooms with our intuitive administration tools
        </Typography>
      </Box>

      <Paper
        elevation={4}
        sx={{
          borderRadius: 4,
          background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)}, ${theme.palette.background.paper})`,
          backdropFilter: 'blur(8px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme.shadows[4]
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          p: 1.5,
          background: alpha(theme.palette.background.default, 0.4),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: '16px 16px 0 0'
        }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            aria-label="Dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{ sx: { display: 'none' } }}
            sx={{
              '& .MuiTabs-flexContainer': {
                gap: 1,
              }
            }}
          >
            {[
              { icon: <EventNoteIcon />, label: 'Schedule' },
              { icon: <PersonAddAlt1Icon />, label: 'Lecturers' },
              { icon: <MeetingRoomIcon />, label: 'Rooms' },
              { icon: <ListAltIcon />, label: "Lecturer List" },

            ].map((tabConfig, index) => (
              <Tab
                key={index}
                icon={tabConfig.icon}
                iconPosition="start"
                label={tabConfig.label}
                {...a11yProps(index)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  minHeight: 'auto',
                  transition: 'all 0.2s ease',
                  color: theme.palette.text.secondary,
                  '&.Mui-selected': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                    color: theme.palette.primary.contrastText,
                    boxShadow: theme.shadows[2],
                    transform: 'scale(1.02)'
                  },
                  '&:hover': {
                    background: alpha(theme.palette.action.hover, 0.1),
                    color: theme.palette.text.primary
                  },
                  '&.Mui-selected:hover': {
                    background: alpha(theme.palette.primary.dark, 0.9),
                    transform: 'scale(1.05)'
                  }
                }}
              />
            ))}
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
        <TabPanel value={tab} index={3}>
          <AllLecturere />
        </TabPanel>
      </Paper>
    </Container>
  );
}