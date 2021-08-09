import React from 'react'
import { Card, CardContent, Grid, Typography } from '@material-ui/core'
import Identicon from 'identicon.js'
import { useStyles } from '../styles'
import { getAge } from '../utils'
import { useDatabase } from '../DatabaseContext'
import { useAuth } from '../AuthContext'
import ProfileUpdateForm from './ProfileUpdateForm'

function UserProfileCard({ userId }) {

  const classes = useStyles()
  const { currentUser } = useAuth()
  const { profiles } = useDatabase()
  const profileRef = profiles[userId]

  return (
    <Card elevation={2}>
      <CardContent>
        <Grid container spacing={6}>

          <Grid container item xs={12} style={{ paddingBottom: '16px', borderBottom: 'solid 1px #ccc' }}>
            <Grid container item xs style={{ margin: 'auto' }}>
              <img alt='account-avatar'
                className={classes.avatar}
                style={{ display: 'block', margin: 'auto' }}
                src={`data:image/png;base64,${new Identicon(userId, 60).toString()}`}
              />
            </Grid>
            <Grid container item xs={9} style={{ margin: 'auto' }}>
              <Grid item xs={12}>
                <Typography variant='h5'>
                  {`${profileRef.gender} ${profileRef.name}`}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle2'>
                  {`${getAge(profileRef.birthYear)} years`}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid container item xs={12}>
            <Grid item xs={12}>
              <Typography variant='body2' paragraph>
                <u>Email</u> {` ${profileRef.email}`}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2'>
                <u>About</u>
              </Typography>
              <Typography variant='body2' className={classes.paragraph}>
                {profileRef.bio}
              </Typography>
            </Grid>
          </Grid>

          {userId === currentUser.uid &&
            <Grid container item xs={12} justifyContent='flex-end'>
              <Grid item>
                <ProfileUpdateForm userId={userId} />
              </Grid>
            </Grid>
          }

        </Grid>
      </CardContent>
    </Card>
  )
}

export default React.memo(UserProfileCard)
