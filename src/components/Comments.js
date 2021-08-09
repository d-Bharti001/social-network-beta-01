import React, { useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Button, CircularProgress, Grid, IconButton, Link, TextField, Tooltip, Typography
} from '@material-ui/core'
import { Refresh, Send } from '@material-ui/icons'
import Identicon from 'identicon.js'
import { useStyles } from '../styles'
import { useDatabase } from '../DatabaseContext'

function Comments({ postId, myUid }) {

  const classes = useStyles()
  const { postComments, loadPostComments, commentPost, profiles } = useDatabase()

  const commentsList = postComments[postId]

  const inputComment = useRef()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitComment = () => {
    if (inputComment.current.value) {
      setSubmitting(true)
      commentPost(postId, inputComment.current.value)
        .then(_ => {
          inputComment.current.value = ''
          setSubmitting(false)
        })
        .catch(err => {
          console.log(err.name, err.message)
          setSubmitting(false)
        })
    }
  }

  const handleLoadComments = () => {
    setLoading(true)
    loadPostComments(postId)
      .then(_ => setLoading(false))
      .catch(err => {
        console.log(err.name, err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    // Load comments if not already loaded
    if (!postComments[postId])
      handleLoadComments()
  }, [])

  return (
    <>
      <Grid container item xs={12} justifyContent='space-evenly'>
        <Grid item xs style={{ margin: 'auto' }}>
          <img alt='account-avatar'
            className={classes.avatar}
            style={{ display: 'block', margin: 'auto' }}
            src={`data:image/png;base64,${new Identicon(myUid, 30).toString()}`}
          />
        </Grid>
        <Grid item xs={8} style={{ margin: 'auto' }}>
          <TextField multiline fullWidth
            placeholder='Add comment...'
            helperText={'Comments can\'t be edited or deleted'}
            inputRef={inputComment}
          />
        </Grid>
        <Grid item xs style={{ margin: 'auto' }}>
          <IconButton
            disabled={loading || submitting}
            onClick={handleSubmitComment}
          >
            <Send />
          </IconButton>
        </Grid>
      </Grid>

      <Grid container item xs={12} justifyContent='flex-end'>
        <Grid item>
          <Tooltip title='Refresh comments'>
            <div>
              <IconButton size='small'
                disabled={loading}
                onClick={handleLoadComments}
              >
                <Refresh fontSize='small' />
              </IconButton>
            </div>
          </Tooltip>
        </Grid>
      </Grid>

      {loading ?
        <Grid container item xs={12} justifyContent='center'>
          <Grid item>
            <Typography variant='subtitle2' color='textSecondary' gutterBottom>
              <CircularProgress size='1rem' style={{ marginRight: '8px' }} />
              Loading comments...
            </Typography>
          </Grid>
        </Grid> :

        (!commentsList || commentsList.length === 0) ?
          <Grid container item xs={12} justifyContent='center'>
            <Grid item>
              <Typography variant='subtitle2' color='textSecondary' gutterBottom>
                No comment
              </Typography>
            </Grid>
          </Grid> :

          commentsList
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((commentObj, key) =>
              <Grid container item xs={12} key={key} style={{ margin: '0 8px', borderTop: 'dashed 1px #ccc' }}>
                <Grid container item xs style={{ margin: 'auto' }}>
                  <img alt='account-avatar'
                    className={classes.avatar}
                    style={{ display: 'block', margin: 'auto' }}
                    src={`data:image/png;base64,${new Identicon(commentObj.commenter, 30).toString()}`}
                  />
                </Grid>
                <Grid container item xs={10}>
                  <Grid item xs={12}>
                    <Link component={RouterLink} to={`/user/${commentObj.commenter}`}>
                      {profiles[commentObj.commenter].name}
                    </Link>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='body2' className={classes.paragraph}>
                      {commentObj.comment}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            )
      }
    </>
  )
}

export default React.memo(Comments)
