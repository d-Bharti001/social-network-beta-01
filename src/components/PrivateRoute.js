import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import FillDetailsForm from './FillDetailsForm'

function PrivateRoute({ component: Component, ...rest }) {

  const { currentUser, currentUserData, currentUserDataLoading } = useAuth()

  return (
    <Route
      {...rest}
      render={props => {
        return (
          currentUser ?
            currentUserDataLoading ?
              <></> :
              currentUserData ?
                <Component {...props} /> :
                <FillDetailsForm {...props} /> :
            <Redirect to={{
              pathname: '/login',
              state: { from: props.location }
            }} />
        )
      }}
    ></Route>
  )
}

export default PrivateRoute
