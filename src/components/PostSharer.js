import React, { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Typography } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { ShareOutlined } from '@material-ui/icons'
import { blue } from '@material-ui/core/colors'
import { useStyles } from '../styles'
import { useDatabase } from '../DatabaseContext'

function PostSharer({ postId, name }) {

  const classes = useStyles()
  const { sharePost } = useDatabase()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const handleSnackbarOpen = () => {
    setSnackbarOpen(true)
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    if(loading)
      return
    setLoading(false)
    setError('')
    setOpen(false)
  }

  const handleConfirm = () => {
    setLoading(true)
    setError('')

    sharePost(postId)
      .then(() => {
        handleClose()
        handleSnackbarOpen()
      })
      .catch(err => {
        console.log(err.name, err.message)
        setError('Something went wrong! Please try again.')
        setLoading(false)
      })
  }

  return (
    <>
      <Button
        fullWidth
        size='small'
        style={{ textTransform: 'none' }}
        onClick={handleOpen}
      >
        <ShareOutlined fontSize='small' style={{ color: blue[700] }} className={classes.postCardIcon} />
        <Typography variant='subtitle2'>Share</Typography>
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
        <DialogTitle>Share post?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Proceed sharing {' '}
            <Typography variant='inherit' color='textPrimary'>
              {name + '\'s'}
            </Typography>
            {' '} post? You won't be able to edit or delete the shared post instance.
          </DialogContentText>
          {error &&
            <Alert severity='error'>{error}</Alert>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary' disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} color='primary' disabled={loading}>
            {loading ? 'Please wait' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        message='Post shared successfully'
        className={classes.snackbar}
      />
    </>
  )
}

export default React.memo(PostSharer)
