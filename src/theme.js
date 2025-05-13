import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:   { main: '#1976d4', contrastText: '#fff' }, // blue
    secondary: { main: '#FF9800', contrastText: '#fff' }, // orange
    error:     { main: '#D32F2F', contrastText: '#fff' }, // strong red
    success:   { main: '#2e7d32', contrastText: '#fff' }, // green
    warning:   { main: '#ED6C02', contrastText: '#fff' }, // amber
    info:      { main: '#0288d1', contrastText: '#fff' }, // cyan
    background: {
      default: '#F4F6F8',
      paper: '#FFFFFF',
    },
    divider: '#E0E3E7',
    text: {
      primary: '#212B36',
      secondary: '#637381',
      disabled: '#B0B8C1',
    },
    action: {
      hover: '#F0F4F8',
      selected: '#E3F2FD',
      disabled: '#B0B8C1',
      disabledBackground: '#F4F6F8',
      focus: '#E3F2FD',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 800, fontSize: '2.75rem', letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.01em' },
    h3: { fontWeight: 700, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1.1rem' },
    subtitle1: { fontWeight: 500, fontSize: '1rem' },
    subtitle2: { fontWeight: 500, fontSize: '0.9rem' },
    body1: { fontWeight: 400, fontSize: '1rem' },
    body2: { fontWeight: 400, fontSize: '0.9rem' },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.03em' },
    caption: { fontWeight: 400, fontSize: '0.8rem', color: '#8A94A6' },
    overline: { fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' },
  },
  shape: {
    borderRadius: 14,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(0,0,0,0.04)',
    '0 4px 16px rgba(25, 118, 210, 0.08)',
    ...Array(23).fill('0 2px 8px rgba(0,0,0,0.04)')
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F4F6F8',
          color: '#212B36',
          fontSmoothing: 'antialiased',
        },
        '::-webkit-scrollbar': {
          width: 8,
          background: '#F4F6F8',
        },
        '::-webkit-scrollbar-thumb': {
          background: '#E0E3E7',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 700,
          boxShadow: 'none',
          transition: 'background 0.2s, box-shadow 0.2s',
        },
        containedPrimary: {
          boxShadow: '0 4px 16px rgba(25, 118, 210, 0.08)',
        },
        outlined: {
          borderWidth: 2,
        },
        sizeLarge: {
          padding: '10px 24px',
          fontSize: '1rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: '#F9FAFB',
        },
        input: {
          padding: '12px 14px',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#FFFFFF',
          color: '#212B36',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#F4F6F8',
          borderRight: '1px solid #E0E3E7',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.95rem',
          background: '#212B36',
        },
      },
    },
  },
});

export default theme;
