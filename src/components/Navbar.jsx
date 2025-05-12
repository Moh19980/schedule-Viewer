import { motion } from "framer-motion";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Container,
  useTheme,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Link as RouterLink, useLocation } from "react-router-dom";

const logoVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  hover: { rotate: [-2, 2, -2], transition: { duration: 1.5, repeat: Infinity } }
};

const navLinks = [
  {
    label: "Schedule",
    to: "/",
    icon: <CalendarMonthIcon sx={{ fontSize: 22 }} />,
    minWidth: 120,
  },
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: <DashboardIcon sx={{ fontSize: 22 }} />,
    minWidth: 140,
  },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const theme = useTheme();

  return (
    <AppBar
      component={motion.div}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      position="sticky"
      elevation={2}
      sx={{
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'linear-gradient(to bottom, #f8f9fa, #fff)',
        py: 1,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo and Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
            <motion.div
              variants={logoVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <IconButton
                component={RouterLink}
                to="/"
                aria-label="Go to home"
                sx={{
                  color: "primary.main",
                  p: 1,
                  '&:hover': { backgroundColor: 'primary.light' }
                }}
              >
                <CalendarMonthIcon fontSize="large" sx={{ fontSize: 32 }} />
              </IconButton>
            </motion.div>
            <Typography
              component={RouterLink}
              to="/"
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: -0.5,
                color: "primary.main",
                textDecoration: "none",
                fontFamily: "'Inter', sans-serif",
                cursor: 'pointer',
                ml: 1,
                transition: "color 0.2s",
                "&:hover": { color: "primary.dark" }
              }}
            >
              ScheduleApp
            </Typography>
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", gap: 3, alignItems: 'center', position: 'relative' }}>
            {navLinks.map(({ label, to, icon, minWidth }) => {
              const isActive = pathname === to;
              return (
                <motion.div
                  key={to}
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Button
                    component={RouterLink}
                    to={to}
                    variant={isActive ? "contained" : "text"}
                    startIcon={icon}
                    aria-current={isActive ? "page" : undefined}
                    sx={{
                      minWidth,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      py: 1,
                      position: 'relative',
                      color: isActive ? "primary.contrastText" : "primary.main",
                      boxShadow: isActive ? 2 : 0,
                      transition: "box-shadow 0.2s, color 0.2s",
                    }}
                  >
                    {label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-underline"
                        style={{
                          position: 'absolute',
                          bottom: -8,
                          left: 0,
                          right: 0,
                          height: 3,
                          borderRadius: 2,
                          background: theme.palette.primary.main,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
