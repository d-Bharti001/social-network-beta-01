import React, { useEffect, useState } from 'react'
import { CircularProgress, Container } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { useAuth } from '../AuthContext'
import { useDatabase } from '../DatabaseContext'
import PostCard from './PostCard'

function PostPage(props) {

  const { currentUser } = useAuth()
  const { posts, loadPost } = useDatabase()

  const paramId = props.match.params.id
  const fetchedPost = posts[paramId]

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load post if not already loaded
    if (!posts[paramId]) {
      setLoading(true)
      loadPost(paramId)
        .then(_ => setLoading(false))
        .catch(err => {
          console.log(err.name, err.message)
          setError('Some error occurred')
          setLoading(false)
        })
    }

    // eslint-disable-next-line
  }, [])

  return (
    <div className='PostPage' style={{ marginBottom: '90px' }}>
      <Container maxWidth='xs'>
        {loading ?
          <div style={{ textAlign: 'center' }}>
            <CircularProgress color='secondary' />
          </div> :
          error ?
            <Alert severity='error'>{error}</Alert> :
            fetchedPost ?
              <PostCard postId={fetchedPost.postId} myUid={currentUser.uid} /> :
              <Alert severity='warning'>Post doesn't exist</Alert>
        }
      </Container>
    </div>
  )
}

export default PostPage
