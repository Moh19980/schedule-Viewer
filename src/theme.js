import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary:   { main: '#00897B' },          // teal
    secondary: { main: '#FFC107' },          // amber
    error:     { main: '#E57373' },          // soft red
    background: { default: '#F5F6F8' },
  },
  typography: {
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 12, textTransform: 'none' } } },
    MuiTextField: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiSelect: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

export default theme;
