import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import DailySchedule from './components/DailySchedule';
import Dashboard from './components/Dashboard';
function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <>
      <Navbar />
      <Container
        sx={{ mb: 4 }}
        maxWidth={isDashboard ? 'lg' : 'lg'}
      >
        <Routes>
          <Route path="/" element={<DailySchedule />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Container>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
