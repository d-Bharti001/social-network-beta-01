import React, { useRef, useState } from 'react'
import { Link as RouterLink, Redirect } from 'react-router-dom'
import { Button, Card, CardContent, Container, Grid, Link, TextField, Typography } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { useStyles } from '../styles'
import { useAuth } from '../AuthContext'

function PasswordResetPage() {

  const classes = useStyles()
  const { currentUser, resetPassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ message: '', type: '' })
  const email = useRef(null)

  const doResetPassword = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus({ message: '', type: '' })
    try {
      await resetPassword(email.current.value)
      setStatus({ message: 'Check email for further process. Then try logging in.', type: 'info' })
    }
    catch (err) {
      console.log('Error')
      console.log(err)
      if (err.code === 'auth/user-not-found')
        setStatus({ message: 'User doesn\'t exist. Please sign up.', type: 'error' })
      else
        setStatus({ message: 'Some error occurred. Please try again.', type: 'error' })
    }
    finally {
      setLoading(false)
    }
  }

  return (
    currentUser ?

      <Redirect to='/' /> :

      <div className='PasswordResetPage'>
        <Container maxWidth='sm'>
          <Card elevation={3} className={classes.cardLoginSignup}>
            <CardContent>
              <Typography variant='h2' align='center' gutterBottom>
                Reset password
              </Typography>
              <hr className={classes.horizontalLine} />
              <form className={classes.form} onSubmit={doResetPassword}>
                {status.message &&
                  <Alert variant='outlined' severity={status.type}>
                    {status.message}
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
                <Button
                  type='submit'
                  fullWidth
                  variant='contained'
                  size='large'
                  color='primary'
                  disabled={loading}
                  className={classes.submitButton}
                >
                  Reset
                </Button>
                <Grid container justifyContent='center'>
                  <Grid item>
                    <Link variant='body2' component={RouterLink} to='/login'>
                      Login
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

export default PasswordResetPage
