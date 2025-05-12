import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Container,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Link as RouterLink, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        backgroundColor: "background.paper",
        backgroundImage: 'linear-gradient(to bottom, #f8f9fa, #ffffff)',
        py: 1,
        transition: 'all 0.3s ease',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo and Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              component={RouterLink}
              to="/"
              sx={{
                color: "primary.main",
                p: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  backgroundColor: 'primary.light',
                }
              }}
            >
              <CalendarMonthIcon fontSize="large" sx={{ fontSize: 32 }} />
            </IconButton>
            <Typography
              variant="h5"
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 800,
                letterSpacing: -0.5,
                color: "primary.main",
                textDecoration: "none",
                fontFamily: "'Inter', sans-serif",
                '&:hover': {
                  opacity: 0.9,
                }
              }}
            >
              ScheduleApp
            </Typography>
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", gap: 3, alignItems: 'center' }}>
            <Button
              component={RouterLink}
              to="/"
              variant={pathname === "/" ? "contained" : "text"}
              startIcon={<CalendarMonthIcon sx={{ fontSize: 22 }} />}
              sx={{
                minWidth: 120,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                py: 1,
                transition: 'all 0.2s ease',
                ...(pathname === "/" ? {
                  bgcolor: 'primary.main',
                  color: 'white',
                  boxShadow: '0 2px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-1px)',
                  }
                } : {
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  }
                })
              }}
            >
              Schedule
            </Button>

            <Button
              component={RouterLink}
              to="/dashboard"
              variant={pathname === "/dashboard" ? "contained" : "text"}
              startIcon={<DashboardIcon sx={{ fontSize: 22 }} />}
              sx={{
                minWidth: 120,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                py: 1,
                transition: 'all 0.2s ease',
                ...(pathname === "/dashboard" ? {
                  bgcolor: 'primary.main',
                  color: 'white',
                  boxShadow: '0 2px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-1px)',
                  }
                } : {
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  }
                })
              }}
            >
              Dashboard
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}