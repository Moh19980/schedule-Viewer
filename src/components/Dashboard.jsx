import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  useTheme,
  Fade,
  alpha,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';

// Import your dashboard-specific icons
import EventNoteIcon from '@mui/icons-material/EventNote'; // For Schedule
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'; // For Add Lecturer
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'; // For Add Room
import ListAltIcon from '@mui/icons-material/ListAlt'; // For All Lecturers

// Import your actual form/content components for the dashboard sections
// Ensure these paths are correct relative to your Dashboard.js file
import ScheduleForm from './ScheduleForm'; // Example component
import AddLecturerForm from './AddLecturerForm'; // Example component
import AddRoomForm from './AddRoomForm'; // Example component
import AllLecturers from './AllLecturere'; // Example component (assuming typo 'AllLecturere' is intended filename)

const Dashboard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedComponents, setLoadedComponents] = useState({});
  const theme = useTheme();

  // Define the items for the dashboard sidebar
  // The 'color' will be used for the active item's background
  const dashboardItems = [
    {
      icon: <EventNoteIcon />,
      label: 'Schedule',
      component: ScheduleForm,
      color: theme.palette.primary.main // Blue, as seen in screenshot
    },
    {
      icon: <PersonAddAlt1Icon />,
      label: 'Lecturers', // Changed from "Add Lecturer" to "Lecturers" as in screenshot
      component: AddLecturerForm,
      color: theme.palette.secondary.main // Example color
    },
    {
      icon: <MeetingRoomIcon />,
      label: 'Rooms', // Changed from "Add Room" to "Rooms" as in screenshot
      component: AddRoomForm,
      color: theme.palette.success.main // Example color
    },
    {
      icon: <ListAltIcon />,
      label: 'Lecturer List',
      component: AllLecturers,
      color: theme.palette.info.main // Example color
    }
  ];

  // Effect to mark a component as "loaded" when its tab is first activated
  // This helps with the Fade animation if components are heavy
  useEffect(() => {
    if (!loadedComponents[activeIndex]) {
      setLoadedComponents(prev => ({
        ...prev,
        [activeIndex]: true
      }));
    }
  }, [activeIndex, loadedComponents]);

  const ActiveComponent = dashboardItems[activeIndex].component;

  // Calculate the height of your sticky Navbar to correctly offset the sticky Dashboard sidebar
  // AppBar sx has py: 1 (theme.spacing(1) top and bottom, so 8px * 2 = 16px)
  // Toolbar default minHeight is usually 56px (mobile) or 64px (desktop)
  // Let's assume desktop toolbar height for calculation.
  const navbarPySpacing = parseInt(theme.spacing(1).replace('px', '')) * 2; // py: 1 means 1 * theme.spacing value * 2
  const toolbarHeight = theme.mixins.toolbar.minHeight || 64; // Default MUI toolbar height for desktop
  const navbarHeight = `${parseFloat(toolbarHeight) + navbarPySpacing}px`;
  const sidebarStickyTopOffset = `calc(${navbarHeight} + ${theme.spacing(2)})`; // Navbar height + some margin
  const sidebarMaxHeight = `calc(100vh - ${sidebarStickyTopOffset} - ${theme.spacing(4)})`; // Full height minus top offset and bottom padding

  return (
    <Box sx={{ pt: 2, pb: 4, px: 2, flexGrow: 1, mt: navbarHeight /* Offset content start by navbar height */ }}>
      <Container maxWidth="xl"> {/* Consistent with your Navbar's maxWidth */}
        {/* Header Title for the Dashboard */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 0.5
            }}
          >
            Management Hub
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Manage schedules, lecturers, and rooms with our intuitive administration tools.
          </Typography>
        </Box>

        {/* Main Layout: Sidebar + Content Area */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 3 } }}>

          {/* Dashboard Sidebar */}
          <Paper
            elevation={1}
            sx={{
              width: { xs: '100%', md: 280 }, // Fixed width on desktop, full on mobile
              p: 1.5, // Padding inside the sidebar paper
              borderRadius: '12px', // Rounded corners matching screenshot
              border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
              alignSelf: 'flex-start', // Important for column layout and sticky positioning
              position: { md: 'sticky' }, // Make sidebar sticky on medium screens and up
              top: { md: sidebarStickyTopOffset }, // Offset below the sticky Navbar
              maxHeight: { md: sidebarMaxHeight }, // Allow sidebar to scroll if content overflows viewport
              overflowY: { md: 'auto' }, // Enable vertical scrolling for sidebar
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(5px)',
            }}
          >
            <List component="nav" sx={{ p: 0 }}>
              {dashboardItems.map((item, index) => (
                <ListItemButton
                  key={item.label}
                  selected={activeIndex === index}
                  onClick={() => setActiveIndex(index)}
                  sx={{
                    borderRadius: '8px', // Rounded corners for each button
                    mb: 0.75, // Space between buttons
                    py: 1.2,  // Vertical padding
                    px: 1.5,  // Horizontal padding
                    transition: 'background-color 0.2s, color 0.2s',
                    '&.Mui-selected': {
                      backgroundColor: item.color,
                      color: theme.palette.getContrastText(item.color),
                      boxShadow: `0 4px 12px ${alpha(item.color, 0.3)}`,
                      '&:hover': {
                        backgroundColor: alpha(item.color, 0.85), // Slightly darker on hover when selected
                      },
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.getContrastText(item.color),
                      },
                      '& .MuiListItemText-primary': {
                        fontWeight: 600,
                      }
                    },
                    '&:not(.Mui-selected):hover': {
                      backgroundColor: alpha(theme.palette.action.hover, 0.08),
                    },
                    '& .MuiListItemIcon-root': {
                      minWidth: 'auto', // Auto width for icon
                      mr: 1.5, // Margin right of icon
                      color: theme.palette.text.secondary, // Default icon color
                    },
                     '& .MuiListItemText-primary': {
                        fontWeight: 500
                    }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>
          </Paper>

          {/* Content Area */}
          <Paper
            elevation={2}
            sx={{
              flexGrow: 1, // Takes up remaining space
              p: { xs: 2, sm: 3, md: 3.5 }, // Responsive padding
              borderRadius: '12px', // Rounded corners matching screenshot
              border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
              minHeight: { xs: 300, md: 500 }, // Minimum height for the content area
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(5px)',
            }}
          >
            {/* Render the active component with a Fade transition */}
            <Fade in={true} timeout={350} key={activeIndex} unmountOnExit>
              <div> {/* Wrapper div for Fade transition and key prop */}
                {loadedComponents[activeIndex] && <ActiveComponent />}
              </div>
            </Fade>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;