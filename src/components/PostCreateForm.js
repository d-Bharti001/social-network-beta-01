import React, { useRef, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, TextField, Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { Add } from '@material-ui/icons'
import { useStyles } from '../styles'
import { useDatabase } from '../DatabaseContext'

function PostCreateForm() {

  const classes = useStyles()
  const { createPost } = useDatabase()
  const minContentLength = useRef(140)
  const [postContent, setPostContent] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({})
  const [open, setOpen] = useState(false)
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
    setPostContent('')
    setConfirmed(false)
    setLoading(false)
    setMsg({})
    setOpen(false)
  }

  const handleChange = (event) => {
    setPostContent(event.target.value)
  }

  const handleSubmit = () => {
    if (postContent.length < minContentLength.current) {
      console.log('Can\'t submit the form')
      return
    }

    if (!confirmed) {
      setLoading(true)
      setMsg({
        type: 'info',
        message: 'Once posted, you won\'t be able to delete or modify the content.'
          + ' Please double check everything before you proceed.'
      })
      setTimeout(() => {
        setLoading(false)
        setConfirmed(true)
      }, 2500)
    }

    else {
      setLoading(true)
      setMsg({})

      createPost(postContent)
        .then(() => {
          handleClose()
          handleSnackbarOpen()
        })
        .catch((err) => {
          setMsg({ type: 'error', message: 'Something went wrong! Please try again.' })
          setLoading(false)
        })
    }
  }

  return (
    <div className='PostCreateForm'>
      <Fab color='secondary' className={classes.fab} onClick={handleOpen}>
        <Add />
      </Fab>

      <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
        <DialogTitle>Create a post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Share your thoughts. Minimum {minContentLength.current} characters required.
          </DialogContentText>
          <TextField
            autoFocus
            margin='normal'
            type='text'
            helperText={`${postContent.length} / ${minContentLength.current}`}
            fullWidth
            multiline
            onChange={handleChange}
          />
          {msg.type &&
            <Alert severity={msg.type}>{msg.message}</Alert>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color='primary' disabled={loading || postContent.length < minContentLength.current}>
            {loading ? 'Please wait' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message='Post created successfully'
        className={classes.snackbar}
      />
    </div>
  )
}

export default PostCreateForm
