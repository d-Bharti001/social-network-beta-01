import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Button, Card, CardActions, CardContent, CardHeader,
  Grid, ImageList, ImageListItem, IconButton, Link, Menu, MenuItem, Typography
} from '@material-ui/core'
import {
  MoreVert, FlagRounded, OutlinedFlagRounded, ShareOutlined,
  MessageOutlined, Refresh, OpenInNew, VisibilityOutlined
} from '@material-ui/icons'
import { blue, red } from '@material-ui/core/colors'
import Identicon from 'identicon.js'
import { useStyles } from '../styles'
import { getLocalDateTime } from '../utils'
import { useDatabase } from '../DatabaseContext'
import PostSharer from './PostSharer'
import Comments from './Comments'

function PostCard({ postId, myUid }) {

  const classes = useStyles()
  const { posts, profiles, viewPost, toggleFlagPost, loadPost } = useDatabase()

  const thisPost = posts[postId]
  const refPost = thisPost.type === 'original' ? thisPost : posts[thisPost.orgPostId]
  const content = refPost.content
  const attachments = refPost.attachments
  const numShares = refPost.sharers.size
  const numViews = refPost.viewers.size
  const numFlags = refPost.flaggers.size
  const flaggedByMe = refPost.flaggers.has(myUid)

  const creatorName = profiles[thisPost.creator].name
  const orgAuthorName = profiles[refPost.creator].name

  const [expanded, setExpanded] = useState(false)
  const [hasRead, setHasRead] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)

  const handleFlag = () => {
    toggleFlagPost(postId).catch(err => console.log(err.name, err.message))
  }

  const handleExpand = () => {
    if (hasRead) {
      setExpanded(true)
    }
    else {
      viewPost(postId)
        .then(_ => {
          setExpanded(true)
          setHasRead(true)
        })
        .catch(err => {
          console.log(err.name, err.message)
        })
    }
  }

  const handleCollapse = () => {
    setExpanded(false)
  }

  const handleCommentsOpen = () => {
    setCommentsOpen(!commentsOpen)
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleRefresh = () => {
    loadPost(thisPost.orgPostId)
      .then(() => {
        handleMenuClose()
      })
      .catch(err => {
        console.log(err.name, err.message)
      })
  }

  return (
    <div className='PostCard'>
      <Card elevation={2} className={classes.postCard}>

        <CardHeader
          avatar={
            <img alt='account-avatar' className={classes.avatar}
              src={`data:image/png;base64,${new Identicon(thisPost.creator, 30).toString()}`}
            />
          }
          title={
            <>
              {thisPost.type === 'shared' && 'Shared by '}
              <Link component={RouterLink} to={`/user/${thisPost.creator}`}>
                {creatorName}
              </Link>
            </>
          }
          subheader={
            <Typography variant='caption' color='textSecondary'>
              {getLocalDateTime(thisPost.createdAt)}
            </Typography>
          }
          action={
            <>
              <IconButton onClick={handleMenuOpen}>
                <MoreVert />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleRefresh}>
                  <Refresh fontSize='small' className={classes.postCardIcon} />
                  <Typography variant='subtitle2'>Refresh post</Typography>
                </MenuItem>
                <MenuItem>
                  <Link component={RouterLink} to={`/post/${postId}`} style={{ textDecoration: 'none' }}>
                    <OpenInNew fontSize='small' className={classes.postCardIcon} />
                    <Typography variant='subtitle2'>Open in a page</Typography>
                  </Link>
                </MenuItem>
              </Menu>
            </>
          }
        />

        <CardContent>

          {thisPost.type === 'shared' &&
            <Typography variant='body2' color='textSecondary' paragraph>
              <Link component={RouterLink} to={`/post/${thisPost.orgPostId}`}>
                View original post
              </Link>
              {' by '}
              <Link component={RouterLink} to={`/user/${refPost.creator}`}>
                {orgAuthorName}
              </Link>
            </Typography>
          }

          <Typography variant='body2' className={classes.paragraph} paragraph>
            {expanded ?
              <>
                {content + ' '}
                <Typography onClick={handleCollapse}
                  variant='inherit'
                  color='primary'
                  className={classes.readMore}
                >
                  Collapse
                </Typography>
              </> :
              <>
                {content.substring(0, 90) + ' '}
                <Typography onClick={handleExpand}
                  variant='inherit'
                  color='primary'
                  className={classes.readMore}
                >
                  ...Read more
                </Typography>
              </>
            }
          </Typography>

          {expanded && attachments.length ?
            <>
              <ImageList rowHeight={180} className={classes.postCardImageList}>
                {attachments.map(a => (
                  <ImageListItem key={a.url} component={Link}
                    href={a.url} target='_blank'
                  >
                    <img src={a.url} alt='' />
                  </ImageListItem>
                ))}
              </ImageList>
              <Typography variant='caption' color='textSecondary'>
                Click on an image to open it in new tab
              </Typography>
            </> :
            <></>
          }

        </CardContent>

        <CardActions>
          <Grid container spacing={2}>

            <Grid container item xs={12} justifyContent='flex-end' style={{ marginRight: '20px' }}>
              {numViews > 0 &&
                <Grid item xs='auto' style={{ color: blue[700], marginLeft: '8px' }}>
                  <VisibilityOutlined fontSize='small' className={classes.postCardIcon} />
                  <Typography variant='caption'>{numViews}</Typography>
                </Grid>
              }
              {numShares > 0 &&
                <Grid item xs='auto' style={{ color: blue[700], marginLeft: '8px' }}>
                  <ShareOutlined fontSize='small' className={classes.postCardIcon} />
                  <Typography variant='caption'>
                    {numShares}
                  </Typography>
                </Grid>
              }
              {numFlags > 0 &&
                <Grid item xs='auto' style={{ color: red[500], marginLeft: '8px' }}>
                  <OutlinedFlagRounded fontSize='small' className={classes.postCardIcon} />
                  <Typography variant='caption'>
                    {numFlags}
                  </Typography>
                </Grid>
              }
            </Grid>

            <Grid container item xs={12} style={{ borderTop: '1px solid #ccc' }}>
              <Grid item xs>
                <Button onClick={handleFlag} fullWidth size='small' style={{ textTransform: 'none' }}>
                  {flaggedByMe ?
                    <>
                      <FlagRounded fontSize='small' style={{ color: red[500] }} className={classes.postCardIcon} />
                      <Typography variant='subtitle2'>Un-flag</Typography>
                    </> :
                    <>
                      <OutlinedFlagRounded fontSize='small' style={{ color: red[500] }} className={classes.postCardIcon} />
                      <Typography variant='subtitle2'>Flag</Typography>
                    </>
                  }
                </Button>
              </Grid>
              <Grid item xs>
                <Button onClick={handleCommentsOpen} fullWidth size='small' style={{ textTransform: 'none' }}>
                  <MessageOutlined fontSize='small' style={{ color: blue[700] }} className={classes.postCardIcon} />
                  <Typography variant='subtitle2'>Comment</Typography>
                </Button>
              </Grid>
              <Grid item xs>
                <PostSharer postId={postId} name={orgAuthorName} />
              </Grid>
            </Grid>

            {commentsOpen &&
              <Comments postId={postId} myUid={myUid} />
            }

          </Grid>
        </CardActions>

      </Card>
    </div>
  )
}

export default React.memo(PostCard)
