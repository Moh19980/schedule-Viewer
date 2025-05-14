import React from "react"; // Make sure React is imported for React.cloneElement
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
  Tooltip, // Added
  useMediaQuery, // Added
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
    // Cloning the icon to adjust its sx props dynamically later
    icon: <CalendarMonthIcon sx={{ fontSize: 22 }} />,
    minWidth: 120, // Original minWidth for larger screens
  },
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: <DashboardIcon sx={{ fontSize: 22 }} />,
    minWidth: 140, // Original minWidth for larger screens
  },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Breakpoint for small screens (e.g., mobile)

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
          <Box sx={{ display: "flex", gap: isSmallScreen ? 0.5 : 1.5, alignItems: 'center', position: 'relative' }}>
            {navLinks.map(({ label, to, icon, minWidth }) => {
              const isActive = pathname === to;
              return (
                <Tooltip title={label} placement="bottom" key={to}>
                  <motion.div // Keeps scaling animation for the button
                    animate={{ scale: isActive ? (isSmallScreen ? 1.05 : 1.08) : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Button
                      component={RouterLink}
                      to={to}
                      variant={isActive ? "contained" : "text"}
                      // Dynamically adjust icon size and provide it to startIcon
                      startIcon={React.cloneElement(icon, {
                        sx: {
                          ...icon.props.sx, // Keep original sx from navLinks
                          fontSize: isSmallScreen ? 24 : icon.props.sx.fontSize || 22, // Slightly larger icon on small screens if no text
                        }
                      })}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={label} // Important for accessibility, especially when text is hidden
                      sx={{
                        minWidth: isSmallScreen ? 'auto' : minWidth, // 'auto' for icon-only, otherwise use defined minWidth
                        px: isSmallScreen ? 1.25 : undefined, // Specific padding for icon-only buttons
                        py: isSmallScreen ? 1.25 : 1, // Consistent vertical padding
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: 'none',
                        position: 'relative',
                        color: isActive ? "primary.contrastText" : "primary.main",
                        // Active state on small screens uses contained variant for background color
                        boxShadow: isActive ? (isSmallScreen ? 1 : 2) : 0, // Subtle shadow for active icon, stronger for labeled button
                        transition: "all 0.2s ease-in-out",
                        '& .MuiButton-startIcon': {
                           // Remove margin next to icon if there's no text label
                          marginRight: isSmallScreen ? 0 : theme.spacing(0.75),
                           marginLeft: isSmallScreen ? 0 : undefined, // Ensure no extra left margin either
                        },
                        // On small screens, the button will effectively be an icon button due to no text label
                        // Ensure contained variant looks good for icon-only buttons
                        ...(isActive && isSmallScreen && {
                          // Custom styles for active icon button if needed, e.g.
                          // backgroundColor: theme.palette.primary.light,
                        }),
                      }}
                    >
                      {!isSmallScreen && label} {/* Render label text only if not small screen */}
                      
                      {/* Underline for active state on larger screens */}
                      {isActive && !isSmallScreen && (
                        <motion.div
                          layoutId="navbar-underline" // Unique ID for layout animation
                          style={{
                            position: 'absolute',
                            bottom: -8, // Position below the button
                            left: "10%", // Start a bit inset
                            right: "10%", // End a bit inset
                            height: 3,
                            borderRadius: 2,
                            background: theme.palette.primary.dark, // Contrasting color for underline
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                      )}
                    </Button>
                  </motion.div>
                </Tooltip>
              );
            })}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}