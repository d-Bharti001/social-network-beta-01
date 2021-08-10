import React, { useRef, useState } from 'react'
import {
  Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, IconButton, ImageList, ImageListItem, ImageListItemBar,
  Fab, Grid, TextField, Typography, Snackbar
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { Add, AddPhotoAlternateOutlined, CancelOutlined } from '@material-ui/icons'
import { useStyles } from '../styles'
import { useAuth } from '../AuthContext'
import { useDatabase } from '../DatabaseContext'
import { storageRef } from '../firebase'

function PostCreateForm() {

  const classes = useStyles()
  const { currentUser } = useAuth()
  const { createPost } = useDatabase()

  const minContentLength = useRef(140)
  const maxFileSize = useRef(5 * 2 ** 20) // 5 MB

  const [postContent, setPostContent] = useState('')
  const [attachments, setAttachments] = useState({})

  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [uploadTime, setUploadTime] = useState('')
  const [uploadProgress, setUploadProgress] = useState({ percent: 0, text: '0/0' })
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
    setUploadTime(new Date().getTime().toString())
  }

  const handleClose = () => {
    if (loading || uploadingPhotos)
      return
    setPostContent('')
    setAttachments({})
    setConfirmed(false)
    setLoading(false)
    setUploadingPhotos(false)
    setUploadTime('')
    setUploadProgress({ percent: 0, text: '0/0' })
    setMsg({})
    setOpen(false)
  }

  const handleChange = (event) => {
    setPostContent(event.target.value)
  }

  const handleFileCapture = (event) => {
    setMsg({})
    var newFile = event.target.files[0]

    // If no file was selected, i.e. newFile is undefined, then return
    if (!newFile)
      return

    // Test that it is image
    if (!/image/.test(newFile.type)) {
      setMsg({ type: 'error', message: 'Only image is accepted' })
      return
    }

    // Test that it doesn't exceed maximum file size
    if (newFile.size > maxFileSize.current) {
      setMsg({ type: 'error', message: `Maximum file size is ${maxFileSize.current / 2 ** 20} MB` })
      return
    }

    setAttachments(prevAttachments => {
      var indices = Object.keys(prevAttachments).sort()
      var nextIndex = indices.length ?
        Number(indices[indices.length - 1]) + 1 :
        0
      var newFileObj = {}
      newFileObj[nextIndex] = newFile

      return { ...prevAttachments, ...newFileObj }
    })
  }

  const handleFileRemove = (index) => {
    setAttachments(prevAttachments => {
      var newAttachments = { ...prevAttachments }
      delete newAttachments[index]
      return newAttachments
    })
  }

  const handleSubmit = async () => {

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

      var attachmentsArray = []
      var photos = Object.assign({}, attachments)
      var photoCount = Object.keys(photos).length

      if (photoCount > 0) {
        setUploadProgress({ percent: 0, text: `0/${photoCount}` })
        setUploadingPhotos(true)

        const folderRef = storageRef.child(`images/${currentUser.uid}`)

        let uploadedPhotoCount = 0

        for (let p of Object.values(photos)) {
          const photoRef = folderRef.child(`${uploadTime}_${p.name}`)
          try {
            // Upload photo
            let snapshot = await photoRef.put(p)
            uploadedPhotoCount += 1
            setUploadProgress({
              percent: (100 * uploadedPhotoCount / photoCount),
              text: `${uploadedPhotoCount}/${photoCount}`
            })

            // Get photo url
            let photoUrl = await snapshot.ref.getDownloadURL()
            attachmentsArray.push({ url: photoUrl, type: p.type })
          }
          catch (err) {
            setMsg({ type: 'error', message: 'Error while uploading photo. Please retry.' })
            setUploadingPhotos(false)
            setUploadProgress({ percent: 0, text: `0/${photoCount}` })
            setLoading(false)

            return  // IMPORTANT
          }
        }

        setUploadingPhotos(false)
      }

      createPost(postContent, attachmentsArray)
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
          <Grid container spacing={2}>

            <Grid item xs={12}>
              <DialogContentText>
                Share your thoughts. Minimum {minContentLength.current} characters required.
              </DialogContentText>
            </Grid>

            <Grid item xs={12}>
              <TextField
                autoFocus
                margin='normal'
                type='text'
                helperText={`${postContent.length} / ${minContentLength.current}`}
                fullWidth
                multiline
                onChange={handleChange}
              />
            </Grid>

            {Object.keys(attachments).length ?
              <Grid item xs={12}>
                <ImageList rowHeight={160} className={classes.postCreateImageList}>
                  {Object.entries(attachments).map(([index, imgFile]) => (
                    <ImageListItem key={index}>
                      <img src={URL.createObjectURL(imgFile)} alt={imgFile.name} />
                      <ImageListItemBar position='top'
                        subtitle={imgFile.name}
                        actionIcon={
                          <IconButton
                            color='primary'
                            style={{ opacity: 0.8 }}
                            disabled={loading || uploadingPhotos}
                            onClick={_ => handleFileRemove(index)}
                          >
                            <CancelOutlined />
                          </IconButton>
                        }
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Grid> :
              <></>
            }

            <Grid container item xs={12} justifyContent='space-between'>
              <Grid item>
                <input
                  accept='image/*'
                  className={classes.fileInput}
                  id='new-image-upload-input'
                  type='file'
                  disabled={loading || uploadingPhotos}
                  onChange={handleFileCapture}
                />
                <label htmlFor='new-image-upload-input'>
                  <Button variant='outlined' disabled={loading || uploadingPhotos} component='span'>
                    <AddPhotoAlternateOutlined />
                  </Button>
                </label>
              </Grid>
              {uploadingPhotos &&
                <Grid container item xs={6} spacing={1} alignItems='center'>
                  <Grid item>
                    <CircularProgress size='1.8rem' variant='determinate' value={uploadProgress.percent} />
                  </Grid>
                  <Grid item>
                    <Typography variant='subtitle2' color='textSecondary'>
                      {`Uploading photos... ${uploadProgress.text}`}
                    </Typography>
                  </Grid>
                </Grid>
              }
            </Grid>

            {msg.type &&
              <Grid item xs={12}>
                <Alert severity={msg.type}>{msg.message}</Alert>
              </Grid>
            }

          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color='primary' disabled={loading || uploadingPhotos}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color='primary' disabled={loading || uploadingPhotos || postContent.length < minContentLength.current}>
            {loading ? 'Please wait' : 'Create'}
          </Button>
        </DialogActions>

      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        message='Post created successfully'
        className={classes.snackbar}
      />
    </div>
  )
}

export default PostCreateForm
