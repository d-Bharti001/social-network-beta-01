import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { CssBaseline } from '@material-ui/core'
import { CustomThemeProvider } from './styles.js'
import { AuthProvider } from './AuthContext'
import PrivateRoute from './components/PrivateRoute'
import NavigationBar from './components/NavigationBar'
import HomePage from './components/HomePage'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import UserPage from './components/UserPage'
import PostPage from './components/PostPage'
import PasswordResetPage from './components/PasswordResetPage'

function App() {
  return (
    <div className='App'>
      <CssBaseline />
      <CustomThemeProvider>
        <AuthProvider>
          <Router>
            <NavigationBar />
            <Switch>
              <PrivateRoute exact path='/' component={HomePage} />
              <PrivateRoute path='/user/:id' component={UserPage} />
              <PrivateRoute path='/post/:id' component={PostPage} />
              <Route path='/login' component={LoginPage} />
              <Route path='/signup' component={SignupPage} />
              <Route path='/reset-password' component={PasswordResetPage} />
            </Switch>
          </Router>
        </AuthProvider>
      </CustomThemeProvider>
    </div>
  )
}

export default App
