import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#19D192',
    },
    secondary: {
      main: '#0F5FD1',
    }
  },
  typography: {
    button: {
      textTransform: 'none'
    }
  }
});

export default theme;

// #0F5FD1 blue [Secondary]
// #1AACC5 lt ble
// #0D91DB blue teal
// #0FDCC9 teal
// #z grean [Primary]