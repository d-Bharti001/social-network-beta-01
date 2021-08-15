import React, { useEffect, useRef, useState } from 'react'
import { Button, Card, CardContent, Container, MenuItem, TextField, Typography } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { useStyles } from '../styles'
import { useAuth } from '../AuthContext'
import { useDatabase } from '../DatabaseContext'

function FillDetailsForm() {

  const classes = useStyles()
  const { currentUser, checkCurrentUserData } = useAuth()
  const { updateProfileDetails } = useDatabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const name = useRef(null)
  const bio = useRef(null)
  const [gender, setGender] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [yearList, setYearList] = useState([])

  useEffect(() => {
    var currentYear = new Date().getFullYear()
    var list = []
    for (var y = currentYear - 10; y >= 1950; y--)
      list.push(String(y))
    setYearList(list)
  }, [])

  const handleGenderChange = (event) => {
    setGender(event.target.value)
  }

  const handleBirthYearChange = (event) => {
    setBirthYear(event.target.value)
  }

  const doFillDetails = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      var userDetails = {
        email: currentUser.email,
        name: name.current.value,
        bio: bio.current.value,
        gender: gender,
        birthYear: Number(birthYear),
        friends: [] // friends list
      }

      // Upload profile details to database
      await updateProfileDetails(currentUser.uid, userDetails)

      await checkCurrentUserData()
    }
    catch (err) {
      console.log('Error:', err.name, err.message)
      setError('Some error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className='FillDetailsForm'>
      <Container maxWidth='sm'>
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
              <TextField
                margin='normal'
                select
                required
                fullWidth
                id='birth-year'
                label='Birth year'
                value={birthYear}
                onChange={handleBirthYearChange}
              >
                {yearList.map((year, key) => <MenuItem value={year} key={key}>{year}</MenuItem>)}
              </TextField>
              {error &&
                <Alert variant='outlined' severity='error' style={{ marginTop: '16px' }}>
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
