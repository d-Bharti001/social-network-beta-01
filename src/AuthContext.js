import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from './firebase'
import { LinearProgress } from '@material-ui/core'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {

  const [currentUser, setCurrentUser] = useState()
  const [loaded, setLoaded] = useState(false)
  const [currentUserData, setCurrentUserData] = useState()
  const [currentUserDataLoading, setCurrentUserDataLoading] = useState(false)

  const signup = (email, password) => {
    return auth.createUserWithEmailAndPassword(email, password)
  }

  const login = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password)
  }

  const logout = () => {
    return auth.signOut()
  }

  const resetPassword = (email) => {
    return auth.sendPasswordResetEmail(email)
  }

  const loadCurrentUserData = async () => {
    if (currentUser) {
      setCurrentUserDataLoading(true)
      try {
        let doc = await db.collection('users').doc(currentUser.uid).get()
        setCurrentUserData(doc.data())
      }
      catch (err) {
        console.log(err)
      }
      finally {
        setCurrentUserDataLoading(false)
      }
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user)
      setLoaded(true)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    loadCurrentUserData()
  }, [currentUser])

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentUserData,
      currentUserDataLoading,
      signup,
      login,
      logout,
      resetPassword,
      loadCurrentUserData,
    }}>
      {loaded ?
        children :
        <LinearProgress color='secondary' />
      }
    </AuthContext.Provider>
  )
}
