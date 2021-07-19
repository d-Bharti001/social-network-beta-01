import React, { useRef, useState } from 'react'
import { Link as RouterLink, Redirect } from 'react-router-dom'
import { Button, Card, CardContent, Container, Grid, Link, TextField, Typography } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { useStyles } from '../styles'
import { useAuth } from '../AuthContext'

function LoginPage({ location }) {

  const classes = useStyles()
  const { currentUser, login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const email = useRef(null)
  const password = useRef(null)

  const doLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email.current.value, password.current.value)
    }
    catch (err) {
      console.log('Error')
      console.log(err)
      if (err.code === 'auth/wrong-password')
        setError('Wrong password!')
      else if (err.code === 'auth/user-not-found')
        setError('User doesn\'t exist. Please sign up.')
      else
        setError('Some error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    currentUser ?

      <Redirect to={location.state ? location.state.from.pathname : '/'} /> :

      <div className='LoginPage'>
        <Container maxWidth='sm'>
          <Card elevation={3} className={classes.cardLoginSignup}>
            <CardContent>
              <Typography variant='h2' align='center' gutterBottom>
                Login
              </Typography>
              <hr className={classes.horizontalLine} />
              <form className={classes.form} onSubmit={doLogin}>
                {error &&
                  <Alert variant='outlined' severity='error'>
                    {error}
                  </Alert>
                }
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
                  inputRef={email}
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
                  inputRef={password}
                />
                <Button
                  type='submit'
                  fullWidth
                  variant='contained'
                  size='large'
                  color='primary'
                  disabled={loading}
                  className={classes.submitButton}
                >
                  Login
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link variant='body2' component={RouterLink} to='/reset-password'>
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
