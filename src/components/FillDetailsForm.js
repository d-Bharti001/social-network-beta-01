import 'date-fns'
import React, { useRef, useState } from 'react'
import { Button, Card, CardContent, Container, MenuItem, TextField, Typography } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import { useStyles } from '../styles'
import { useAuth } from '../AuthContext'

function FillDetailsForm() {

  const classes = useStyles()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const name = useRef(null)
  const bio = useRef(null)
  const [gender, setGender] = useState('')
  const [dob, setDob] = useState(new Date('1999-03-30'))

  const handleGenderChange = (event) => {
    setGender(event.target.value)
  }

  const handleDateChange = (date) => {
    setDob(date)
  }

  const doFillDetails = async (event) => {
    event.preventDefault()
    // setLoading(true)
    // setError('')
    try {
      // TODO:
      // await upload to firestore - preferably using useProfiles()
      // then call useAuth()'s loadCurrentUserData()
      // then the component will be unmounted due to the logic in PrivateRoute.js
      // so don't do any state updates here
    }
    catch (err) {
      console.log('Error')
      console.log(err)
      setError('Some error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className='FillDetailsForm'>
      <Container maxWidth='md'>
        <Card elevation={2} className={classes.cardLoginSignup}>
          <CardContent>
            <Typography variant='h2' align='center' gutterBottom>
              Finish setting up your account
            </Typography>
            <hr className={classes.horizontalLine} />
            <form className={classes.form} onSubmit={doFillDetails}>
              <TextField
                margin='normal'
                fullWidth
                id='email'
                type='email'
                label='Email'
                disabled
                value={currentUser.email}
              />
              <TextField
                margin='normal'
                required
                fullWidth
                id='name'
                type='text'
                label='Name'
                autoFocus
                inputRef={name}
              />
              <TextField
                margin='normal'
                required
                fullWidth
                multiline
                id='bio'
                type='text'
                label='Your bio'
                inputRef={bio}
              />
              <TextField
                margin='normal'
                select
                required
                fullWidth
                id='gender'
                label='Gender'
                value={gender}
                onChange={handleGenderChange}
              >
                <MenuItem value='Mr.'>Mr.</MenuItem>
                <MenuItem value='Ms.'>Ms.</MenuItem>
              </TextField>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  required
                  variant='inline'
                  format='dd/MM/yyyy'
                  margin='normal'
                  id='dob'
                  label='Date of birth (DD/MM/YYYY)'
                  value={dob}
                  maxDate='2020-03-01'
                  onChange={handleDateChange}
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                  className={classes.datePicker}
                />
              </MuiPickersUtilsProvider>
              {error &&
                <Alert variant='outlined' severity='error' style={{marginTop: '16px'}}>
                  {error}
                </Alert>
              }
              <Button
                type='submit'
                fullWidth
                variant='contained'
                size='large'
                color='primary'
                disabled={loading}
                className={classes.submitButton}
              >
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div >
  )
}

export default FillDetailsForm
