import { createTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors'

export const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: theme.spacing(1),
  },
  title: {
    flexGrow: 1,
  },
  horizontalLine: {
    height: '1px',
    border: '0px',
    borderTop: '1px solid #ccc',
    padding: '0px',
    margin: theme.spacing(2),
  },
  cardLoginSignup: {
    margin: theme.spacing(8, 'auto'),
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
  },
  form: {
    margin: theme.spacing(4, 2),
  },
  submitButton: {
    margin: theme.spacing(2, 'auto', 4),
  },
  datePicker: {
    width: '100%',
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  snackbar: {
    [theme.breakpoints.down('xs')]: {
      bottom: 90,
    },
  },
}), { index: 1 })

export function CustomThemeProvider({ children }) {

  const theme = createTheme({
    palette: {
      primary: blue,
    },
  })

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}
