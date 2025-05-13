import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  useTheme, 
  ButtonGroup,
  Button,
  alpha,
  Fade
} from '@mui/material';

// Import Icons
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Form Components
import ScheduleForm from './ScheduleForm';
import AddLecturerForm from './AddLecturerForm';
import AddRoomForm from './AddRoomForm';
import AllLecturers from './AllLecturere'; // Fixed typo in the name

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loadedComponents, setLoadedComponents] = useState({});
  const theme = useTheme();
  
  // Tab configuration with icons, labels, and accent colors
  const tabs = [
    { 
      icon: <EventNoteIcon fontSize="small" />, 
      label: 'Schedule',
      color: theme.palette.primary.main,
      component: ScheduleForm
    },
    { 
      icon: <PersonAddAlt1Icon fontSize="small" />, 
      label: 'Lecturers',
      color: theme.palette.secondary.main,
      component: AddLecturerForm
    },
    { 
      icon: <MeetingRoomIcon fontSize="small" />, 
      label: 'Rooms',
      color: theme.palette.success.main,
      component: AddRoomForm
    },
    { 
      icon: <ListAltIcon fontSize="small" />, 
      label: 'Lecturer List',
      color: theme.palette.info.main,
      component: AllLecturers
    }
  ];

  // Load the component for the current tab and keep it in state
  useEffect(() => {
    if (!loadedComponents[activeTab]) {
      setLoadedComponents(prev => ({
        ...prev,
        [activeTab]: true
      }));
    }
  }, [activeTab, loadedComponents]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.07)} 0%, ${alpha(theme.palette.secondary.light, 0.07)} 100%)`,
        py: { xs: 3, md: 5 },
        px: 2
      }}
    >
      <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 6 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.5px',
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.warning.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1.5,
              fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3rem' }
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

        {/* Main Card */}
        <Paper
          elevation={6}
          sx={{
            borderRadius: 6,
            background: theme.palette.background.paper,
            backgroundImage: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)}, ${theme.palette.background.paper})`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 8px 40px 0 ${alpha(theme.palette.primary.dark, 0.08)}`,
            overflow: 'hidden'
          }}
        >
          {/* Navigation - Button Group Style */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2,
              background: alpha(theme.palette.background.default, 0.4),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              position: 'relative'
            }}
          >
            <Box sx={{ display: { xs: 'flex', md: 'none' }, position: 'absolute', left: 16 }}>
              <ButtonGroup size="small">
                <Button 
                  onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}
                  disabled={activeTab === 0}
                >
                  <ChevronLeftIcon fontSize="small" />
                </Button>
                <Button 
                  onClick={() => setActiveTab(prev => Math.min(tabs.length - 1, prev + 1))}
                  disabled={activeTab === tabs.length - 1}
                >
                  <ChevronRightIcon fontSize="small" />
                </Button>
              </ButtonGroup>
            </Box>
            
            <ButtonGroup 
              variant="contained" 
              aria-label="dashboard navigation"
              sx={{
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                borderRadius: '40px',
                padding: '5px',
                background: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'blur(8px)',
                '& .MuiButtonGroup-grouped': {
                  border: 'none !important',
                  mx: 0.5,
                  borderRadius: '30px !important',
                },
                display: { xs: 'none', md: 'flex' }
              }}
            >
              {tabs.map((tab, index) => (
                <Button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  aria-pressed={activeTab === index}
                  aria-controls={`dashboard-panel-${index}`}
                  startIcon={tab.icon}
                  sx={{
                    bgcolor: activeTab === index ? tab.color : 'transparent',
                    color: activeTab === index ? '#fff' : 'text.secondary',
                    '&:hover': {
                      bgcolor: activeTab === index 
                        ? alpha(tab.color, 0.9) 
                        : alpha(theme.palette.action.hover, 0.15)
                    },
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1,
                    px: 2.5,
                    transition: 'all 0.2s ease',
                    '&.MuiButton-root': {
                      minWidth: '120px'
                    }
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </ButtonGroup>
            
            {/* Mobile current tab indicator */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <Button
                variant="text"
                startIcon={tabs[activeTab].icon}
                sx={{
                  color: tabs[activeTab].color,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                {tabs[activeTab].label}
              </Button>
            </Box>
          </Box>

          {/* Content Area - Pre-loaded and cached */}
          <Box sx={{ position: 'relative', minHeight: '450px' }}>
            {tabs.map((tab, index) => {
              // Only render components that have been visited
              const Component = tab.component;
              return loadedComponents[index] ? (
                <Fade key={index} in={activeTab === index} timeout={300}>
                  <Box
                    role="tabpanel"
                    hidden={activeTab !== index}
                    id={`dashboard-panel-${index}`}
                    aria-labelledby={`dashboard-tab-${index}`}
                    sx={{
                      p: { xs: 2.5, md: 4 },
                      position: activeTab === index ? 'relative' : 'absolute',
                      width: '100%',
                      top: 0,
                      left: 0,
                      display: activeTab === index ? 'block' : 'none'
                    }}
                  >
                    <Component />
                  </Box>
                </Fade>
              ) : null;
            })}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;

