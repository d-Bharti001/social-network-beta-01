import React, { useRef, useState } from 'react'
import { Link as RouterLink, Redirect } from 'react-router-dom'
import { Button, Card, CardContent, Container, Grid, Link, TextField, Typography } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { useStyles } from '../styles'
import { useAuth } from '../AuthContext'

function SignupPage() {

  const classes = useStyles()
  const { currentUser, signup } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const email = useRef(null)
  const password = useRef(null)
  const passwordConf = useRef(null)

  const doSignup = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    if (password.current.value !== passwordConf.current.value) {
      setError('Passwords don\'t match')
      setLoading(false)
      return
    }
    try {
      let res = await signup(email.current.value, password.current.value)
      console.log(res)
    }
    catch (err) {
      console.log('Error')
      console.log(err)
      if (err.code === 'auth/email-already-in-use')
        setError('Email already registered. Please try using different email.')
      else if (err.code === 'auth/weak-password')
        setError('Weak password. Should be of at least 6 characters.')
      else
        setError('Some error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    currentUser ?

      <Redirect to='/' /> :

      <div className='SignupPage'>
        <Container maxWidth='sm'>
          <Card elevation={3} className={classes.cardLoginSignup}>
            <CardContent>
              <Typography variant='h2' align='center' gutterBottom>
                Sign up
              </Typography>
              <hr className={classes.horizontalLine} />
              <form className={classes.form} onSubmit={doSignup}>
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
                  label='Password (at least 6 characters)'
                  type='password'
                  autoComplete='current-password'
                  inputRef={password}
                />
                <TextField
                  variant='outlined'
                  margin='normal'
                  required
                  fullWidth
                  id='password-confirm'
                  label='Re-type password'
                  type='password'
                  autoComplete='current-password'
                  inputRef={passwordConf}
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
                  Sign up
                </Button>
                <Grid container justifyContent='flex-end'>
                  <Grid item>
                    <Link variant='body2' component={RouterLink} to='/login'>
                      {'Already have an account? Login'}
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

export default SignupPage
