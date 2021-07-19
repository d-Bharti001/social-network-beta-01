import React from 'react'
import { Link } from 'react-router-dom'
import { AppBar, Button, IconButton, Toolbar, Tooltip, Typography } from '@material-ui/core'
import { AccountCircleRounded, ExitToAppRounded, HomeRounded } from '@material-ui/icons'
import { useStyles } from '../styles'
import { useAuth } from '../AuthContext'

function NavigationBar() {

  const classes = useStyles()
  const { currentUser } = useAuth()

  return (
    <>
      <AppBar position='fixed'>
        <Toolbar>
          <Typography variant='h6' className={classes.title}>
            Social Network beta
          </Typography>
          {currentUser ?
            <>
              <Tooltip title='Home'>
                <IconButton color='inherit' component={Link} to='/'>
                  <HomeRounded />
                </IconButton>
              </Tooltip>
              <Tooltip title='Your Profile'>
                <IconButton color='inherit' component={Link} to='/me'>
                  <AccountCircleRounded />
                </IconButton>
              </Tooltip>
              <Tooltip title='Logout'>
                <IconButton color='inherit'>
                  <ExitToAppRounded />
                </IconButton>
              </Tooltip>
            </> :
            <>
              <Button color='inherit' component={Link} to='/login' className={classes.menuButton}>
                Login
              </Button>
              <Button color='inherit' component={Link} to='/signup' className={classes.menuButton}>
                Signup
              </Button>
            </>
          }
        </Toolbar>
      </AppBar>
      <div style={{ height: '100px' }}></div>
    </>
  )
}

export default NavigationBar
