import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

// Helper function to check if JWT token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch {
    return true // If we can't decode, assume it's expired
  }
}

interface User {
  id: string
  username: string
  email: string
  role: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const token = localStorage.getItem('da-cms-token')
    if (token) {
      // Check if token is expired before making API call
      if (isTokenExpired(token)) {
        console.log('Token is expired, removing from storage')
        localStorage.removeItem('da-cms-token')
        setLoading(false)
      } else {
        verifyToken(token)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token: string, retryCount = 0) => {
    try {
      const response = await axios.get('https://da-pages-be.vercel.app/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 5000 // 5 second timeout
      })

      if (response.data.user) {
        setUser(response.data.user)
        setIsAuthenticated(true)
      }
    } catch (error: any) {
      // Only remove token if it's an authentication error (401), not network errors
      if (error.response?.status === 401) {
        console.log('Token is invalid or expired, removing from storage')
        localStorage.removeItem('da-cms-token')
      } else if (retryCount < 2) {
        // Network error - retry up to 2 times with exponential backoff
        console.log(`Network error during token verification, retrying... (${retryCount + 1}/3)`)
        setTimeout(() => verifyToken(token, retryCount + 1), Math.pow(2, retryCount) * 1000)
        return
      } else {
        // Network error after retries - keep the token and try again later
        console.log('Network error during token verification after retries, keeping token for later retry')
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('https://da-pages-be.vercel.app/api/auth/login', {
        username,
        password
      })

      if (response.data.token && response.data.user) {
        const token = response.data.token
        const userData = response.data.user

        localStorage.setItem('da-cms-token', token)
        setUser(userData)
        setIsAuthenticated(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('da-cms-token')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}