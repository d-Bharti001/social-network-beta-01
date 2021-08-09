import React, { useEffect, useRef, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { Edit } from '@material-ui/icons'
import { useDatabase } from '../DatabaseContext'
import { useAuth } from '../AuthContext'

function ProfileUpdateForm({ userId }) {

  const { currentUser } = useAuth()
  const { profiles, updateProfileDetails } = useDatabase()
  const profileRef = profiles[userId]

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({})
  const name = useRef()
  const bio = useRef()
  const [gender, setGender] = useState(`${profileRef.gender}`)
  const [birthYear, setBirthYear] = useState(`${profileRef.birthYear}`)
  const [yearList, setYearList] = useState([])

  useEffect(() => {
    var currentYear = new Date().getFullYear()
    var list = []
    for (var y = currentYear - 10; y >= 1950; y--)
      list.push(String(y))
    setYearList(list)
  }, [])

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setMsg({})
    setLoading(false)
    setOpen(false)
  }

  const handleGenderChange = (event) => {
    setGender(event.target.value)
  }

  const handleBirthYearChange = (event) => {
    setBirthYear(event.target.value)
  }

  const updateName = () => {
    if (name.current.value)
      handleSubmit({ name: name.current.value })
  }

  const updateBio = () => {
    if (bio.current.value)
      handleSubmit({ bio: bio.current.value })
  }

  const updateGender = () => {
    if (gender)
      handleSubmit({ gender: gender })
  }

  const updateBirthYear = () => {
    if (birthYear)
      handleSubmit({ birthYear: Number(birthYear) })
  }

  const handleSubmit = (obj) => {
    if (currentUser.uid === userId) {
      setLoading(true)
      setMsg({})
      updateProfileDetails(userId, obj)
        .then(_ => {
          setMsg({ type: 'success', message: 'Updated successfully' })
          setLoading(false)
        })
        .catch(err => {
          console.log(err.name, err.message)
          setMsg({ type: 'error', message: 'Some error occurred' })
          setLoading(false)
        })
    }
  }

  return (
    <>
      <Button variant='outlined' size='small' color='secondary'
        startIcon={<Edit />}
        onClick={handleOpen}
      >
        Edit info
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>

        <DialogTitle>Edit your profile</DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>

            {msg.type &&
              <Grid container item xs={12} justifyContent='center'>
                <Alert severity={msg.type}>{msg.message}</Alert>
              </Grid>
            }

            <Grid container item xs={12} alignItems='center' justifyContent='space-between'>
              <Grid item xs>
                <TextField fullWidth
                  label='Name'
                  defaultValue={profileRef.name}
                  inputRef={name}
                />
              </Grid>
              <Grid item style={{ marginLeft: '8px' }}>
                <Button variant='outlined' size='small' disabled={loading}
                  onClick={updateName}
                >
                  {loading ? 'Please wait' : 'Update'}
                </Button>
              </Grid>
            </Grid>

            <Grid container item xs={12} alignItems='center' justifyContent='space-between'>
              <Grid item xs>
                <TextField fullWidth multiline
                  label='Bio'
                  defaultValue={profileRef.bio}
                  inputRef={bio}
                />
              </Grid>
              <Grid item style={{ marginLeft: '8px' }}>
                <Button variant='outlined' size='small' disabled={loading}
                  onClick={updateBio}
                >
                  {loading ? 'Please wait' : 'Update'}
                </Button>
              </Grid>
            </Grid>

            <Grid container item xs={12} alignItems='center' justifyContent='space-between'>
              <Grid item xs>
                <TextField fullWidth select
                  label='Gender'
                  defaultValue={profileRef.gender}
                  onChange={handleGenderChange}
                >
                  <MenuItem value='Mr.'>Mr.</MenuItem>
                  <MenuItem value='Ms.'>Ms.</MenuItem>
                </TextField>
              </Grid>
              <Grid item style={{ marginLeft: '8px' }}>
                <Button variant='outlined' size='small' disabled={loading}
                  onClick={updateGender}
                >
                  {loading ? 'Please wait' : 'Update'}
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid container item xs={12} alignItems='center' justifyContent='space-between'>
            <Grid item xs>
              <TextField fullWidth select
                label='Birth year'
                defaultValue={profileRef.birthYear}
                onChange={handleBirthYearChange}
              >
                {yearList.map((year, key) => <MenuItem value={year} key={key}>{year}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item style={{ marginLeft: '8px' }}>
              <Button variant='outlined' size='small' disabled={loading}
                onClick={updateBirthYear}
              >
                {loading ? 'Please wait' : 'Update'}
              </Button>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Close
          </Button>
        </DialogActions>

      </Dialog>
    </>
  )
}

export default React.memo(ProfileUpdateForm)
