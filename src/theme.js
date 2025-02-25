import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Poppins',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    button: {
      fontFamily: 'Poppins'
    }
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: 'Poppins'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'Poppins'
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          fontFamily: 'Poppins'
        }
      }
    }
  }
});

export default theme;