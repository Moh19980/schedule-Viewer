import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Container, Box, useTheme } from "@mui/material"; // Added Box and useTheme
import Navbar from "./components/Navbar";
import DailySchedule from "./components/DailySchedule";
import Dashboard from "./components/Dashboard"; // Assuming this is the Dashboard I'll provide below

// It's good practice to define AppContent outside App if it uses hooks like useLocation
function AppContent() {
  const location = useLocation();
  const theme = useTheme(); // To calculate Navbar height
  const isDashboard = location.pathname === "/dashboard";

  // Calculate Navbar height for offsetting content
  // Your Navbar has py: 1 (theme.spacing(1) top & bottom = 16px if spacing is 8px)
  // Toolbar default minHeight is 56px or 64px. Let's use 64px as a common desktop value.
  const navbarVerticalPadding =
    parseInt(theme.spacing(1).replace("px", "")) * 2;
  const typicalToolbarHeight = theme.mixins.toolbar.minHeight || 64; // Use theme.mixins
  const navbarTotalHeight = `${
    parseFloat(typicalToolbarHeight) + navbarVerticalPadding
  }px`;

  return (
    <>
      <Navbar />
      {/* This Box acts as the main page content area below the Navbar */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: navbarTotalHeight, // Offset content by Navbar's height
          width: "100%",
        }}
      >
        <Container
          sx={{
            py: { xs: 2, md: 3 }, // Add some vertical padding inside the container
            mb: 4, // Keep your bottom margin
          }}
          // The screenshot of your dashboard looks quite wide.
          // Consider using 'xl' if 'lg' feels too narrow for the dashboard.
          maxWidth={isDashboard ? "xl" : "lg"} // Changed to 'xl' for dashboard as it's common
        >
          <Routes>
            <Route path="/" element={<DailySchedule />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Container>
      </Box>
    </>
  );
}

export default function App() {
  // Assuming you have ThemeProvider and CssBaseline wrapping BrowserRouter,
  // or at a higher level if not shown.
  return (
    <BrowserRouter>
      {/* If you have a ThemeProvider, it should wrap AppContent */}
      {/* <ThemeProvider theme={yourTheme}> */}
      {/* <CssBaseline /> */}
      <AppContent />
      {/* </ThemeProvider> */}
    </BrowserRouter>
  );
}
