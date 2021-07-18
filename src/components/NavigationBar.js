import React from 'react'
import { Link } from 'react-router-dom'
import { AppBar, Button, Toolbar, Typography } from '@material-ui/core'
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
              <Button color='inherit' component={Link} to='/'>
                Home
              </Button>
              <Button color='inherit' component={Link} to='/me'>
                My Profile
              </Button>
              <Button color='inherit'>
                Logout
              </Button>
              {/* <Nav.Link as={Link} to='/'>Home</Nav.Link>
              <Nav.Link as={Link} to='/me'>My profile</Nav.Link>
              <Nav.Link>Logout</Nav.Link> */}
            </> :
            <>
              <Button color='inherit' component={Link} to='/login'>
                Login
              </Button>
              <Button color='inherit' component={Link} to='/signup'>
                Signup
              </Button>
            </>
          }

        </Toolbar>
      </AppBar>
    </>
  )

  // return (
  //   <>
  //     <Navbar collapseOnSelect
  //       expand='lg' bg='dark' variant='dark'
  //       fixed='top' className='shadow'>
  //       <Container>
  //         <Navbar.Brand>Social Network beta</Navbar.Brand>
  //         <Navbar.Toggle aria-controls='responsive-navbar-nav' />
  //         <Navbar.Collapse id='responsive-navbar-nav'>
  //           <Nav className='ml-auto'>
  //             {currentUser ?
  //               <>
  //                 <Nav.Link as={Link} to='/'>Home</Nav.Link>
  //                 <Nav.Link as={Link} to='/me'>My profile</Nav.Link>
  //                 <Nav.Link>Logout</Nav.Link>
  //               </> :
  //               <>
  //                 <Nav.Link as={Link} to=''>Login</Nav.Link>
  //                 <Nav.Link as={Link} to='signup'>Signup</Nav.Link>
  //               </>
  //             }
  //           </Nav>
  //         </Navbar.Collapse>
  //       </Container>
  //     </Navbar>
  //     <div className='mb-5'><br /><br /></div>
  //   </>
  // )
}

export default NavigationBar
