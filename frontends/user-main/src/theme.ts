import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

// Neutral placeholder palette - swap these values for your own brand colours
const appColors = {
  ink: '#00171F',
  deepBlue: '#003459',  // Primary colour
  midBlue: '#007EA7',
  skyBlue: '#00A8E8',
  parchment: '#EEEBE7',
  yellow: '#FDCA40',    // Info/warning yellow
  red: '#EF3E36',       // Accent/error red
};

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: appColors.deepBlue,
          light: appColors.midBlue,
          dark: appColors.ink,
        },
        secondary: {
          main: appColors.midBlue,
          light: appColors.skyBlue,
          dark: appColors.deepBlue,
        },
        error: {
          main: appColors.red,
        },
        warning: {
          main: appColors.yellow,
          contrastText: appColors.ink,
        },
        info: {
          main: appColors.skyBlue,
        },
        background: {
          default: '#f8fafc',
          paper: '#ffffff',
        },
        text: {
          primary: appColors.ink,
          secondary: '#475569',
        },
        divider: '#e2e8f0',
      },
    },
    dark: {
      palette: {
        primary: {
          main: appColors.midBlue,
          light: appColors.skyBlue,
          dark: appColors.deepBlue,
        },
        secondary: {
          main: appColors.skyBlue,
          light: '#4fc3f7',
          dark: appColors.midBlue,
        },
        error: {
          main: appColors.red,
        },
        warning: {
          main: appColors.yellow,
          contrastText: appColors.ink,
        },
        info: {
          main: appColors.skyBlue,
        },
        background: {
          default: appColors.ink,
          paper: '#0a2533',
        },
        text: {
          primary: appColors.parchment,
          secondary: '#cbd5e1',
        },
        divider: '#334155',
      },
    },
  },
  typography: {
    fontFamily: [
      '"Nunito Sans"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
        head: ({ theme }) => ({
          fontWeight: 600,
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.background.default,
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'dark'
            ? theme.palette.grey[700]
            : theme.palette.grey[300],
          color: theme.palette.text.secondary,
          fontWeight: 500,
        }),
      },
    },
  },
});

export default theme;
