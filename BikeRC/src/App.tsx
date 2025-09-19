import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { JobProvider } from './contexts/JobContext';
import { useJobStatus } from './hooks/useJobStatus';
import Dashboard from './components/Dashboard';
import MeasurementsPage from './components/MeasurementsPage';
import AnalysesPage from './components/AnalysesPage';
import MeasurementDetail from './pages/pomiary/[id]';
import AnalysisDetail from './pages/analizy/[id]';
import NewMeasurementPage from './pages/pomiary/new';
import NewAnalysisPage from './pages/analizy/new';
import SettingsPage from './pages/settings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#22D3BB', // New accent color
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 10,
  },
});

// Component to handle job status polling
const JobStatusManager: React.FC = () => {
  useJobStatus(); // This hook handles all the polling logic
  return null;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <JobProvider>
        <JobStatusManager />
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />}>
              <Route index element={<Navigate to="/pomiary" replace />} />
              <Route path="pomiary" element={<MeasurementsPage />} />
              <Route path="pomiary/new" element={<NewMeasurementPage />} />
              <Route path="pomiary/:id" element={<MeasurementDetail />} />
              <Route path="analizy" element={<AnalysesPage />} />
              <Route path="analizy/new" element={<NewAnalysisPage />} />
              <Route path="analizy/:id" element={<AnalysisDetail />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </JobProvider>
    </ThemeProvider>
  );
}

export default App;