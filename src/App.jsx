import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import DailySchedule from './components/DailySchedule';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      {/* page body */}
      <Container sx={{ mb: 4 }}>
        <Routes>
          <Route path="/" element={<DailySchedule />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}
