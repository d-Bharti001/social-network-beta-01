import React, { useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Button, Card, CardContent, Container, Grid, Link, TextField, Typography } from '@material-ui/core'
import { useStyles } from '../styles'

// {props.location.state ?
//   props.location.state.from.pathname :
//   ''
// }

function LoginPage(props) {

  const classes = useStyles()
  const email = useRef(null)
  const password = useRef(null)

  return (
    <div className='LoginPage'>
      <Container maxWidth='sm'>
        <Card elevation={3} className={classes.cardLoginSignup}>
          <CardContent>
            <Typography variant='h2' align='center' gutterBottom>
              Login
            </Typography>
            <hr className={classes.horizontalLine} />
            <form className={classes.form}>
              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                id='email'
                type='email'
                label='Email Address'
                autoComplete='email'
                autoFocus
                ref={email}
              />
              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                id='password'
                label='Password'
                type='password'
                autoComplete='current-password'
                ref={password}
              />
              <Button
                type='submit'
                fullWidth
                variant='contained'
                size='large'
                color='primary'
                className={classes.submitButton}
              >
                Login
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href='#' variant='body2'>
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link variant='body2' component={RouterLink} to='/signup'>
                    {'Don\'t have an account? Sign Up'}
                  </Link>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}

export default LoginPage
