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
}))

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
