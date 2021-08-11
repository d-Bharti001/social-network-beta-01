import React, { useEffect, useState } from 'react'
import { CircularProgress, Container } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { useDatabase } from '../DatabaseContext'
import UserProfileCard from './UserProfileCard'

function UserPage(props) {

  const { profiles, loadProfile } = useDatabase()

  const paramId = props.match.params.id
  const fetchedProfile = profiles[paramId]

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load profile if not already loaded
    if (!profiles[paramId]) {
      setLoading(true)
      loadProfile(paramId)
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
    <div className='UserPage' style={{ marginBottom: '90px' }}>
      <Container maxWidth='xs'>
        {loading ?
          <div style={{ textAlign: 'center' }}>
            <CircularProgress color='secondary' />
          </div> :
          error ?
            <Alert severity='error'>{error}</Alert> :
            fetchedProfile ?
              <UserProfileCard userId={fetchedProfile.userId} /> :
              <Alert severity='warning'>User not available</Alert>
        }
      </Container>
    </div>
  )
}

export default UserPage
