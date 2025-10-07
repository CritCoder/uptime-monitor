import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export const SocketContext = createContext()

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token')
      // Get base URL by removing /api suffix if present
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      const baseUrl = apiUrl.replace(/\/api$/, '')
      const newSocket = io(baseUrl, {
        auth: { token }
      })

      newSocket.on('connect', () => {
        console.log('🔌 Connected to server')
        setConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from server')
        setConnected(false)
      })

      newSocket.on('monitor-update', (data) => {
        console.log('📊 Monitor update:', data)
        // Handle monitor updates
      })

      newSocket.on('incident-update', (data) => {
        console.log('🚨 Incident update:', data)
        toast.error(`Incident: ${data.title}`, {
          duration: 5000,
        })
      })

      newSocket.on('notification', (data) => {
        console.log('🔔 Notification:', data)
        toast(data.message, {
          icon: '🔔',
          duration: 5000,
        })
      })

      newSocket.on('check-result', (data) => {
        console.log('✅ Check result:', data)
        // Handle real-time check results
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
        setConnected(false)
      }
    }
  }, [user])

  const joinWorkspace = (workspaceId) => {
    if (socket) {
      socket.emit('join-workspace', workspaceId)
    }
  }

  const leaveWorkspace = (workspaceId) => {
    if (socket) {
      socket.emit('leave-workspace', workspaceId)
    }
  }

  return (
    <SocketContext.Provider value={{
      socket,
      connected,
      joinWorkspace,
      leaveWorkspace
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
