import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from './firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {

  const [currentUser, setCurrentUser] = useState()
  const [loaded, setLoaded] = useState(false)

  const signup = (email, password) => {
    return auth.createUserWithEmailAndPassword(email, password);
  }

  const login = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
  }

  const logout = () => {
    return auth.signOut();
  }

  const resetPassword = (email) => {
    return auth.sendPasswordResetEmail(email);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoaded(true);
    })

    return unsubscribe;
  }, [])

  return (
    <AuthContext.Provider value={{
      currentUser,
      signup,
      login,
      logout,
      resetPassword
    }}>
      {loaded && children}
    </AuthContext.Provider>
  )
}
