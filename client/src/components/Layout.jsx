import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import {
  ChartBarIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  BellIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Monitors', href: '/monitors', icon: ServerIcon },
  { name: 'Incidents', href: '/incidents', icon: ExclamationTriangleIcon },
  { name: 'Alerts', href: '/alerts', icon: BellIcon },
  { name: 'Status Pages', href: '/status-pages', icon: ServerIcon },
  { name: 'Integrations', href: '/integrations', icon: PuzzlePieceIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { connected } = useSocket()
  const location = useLocation()
  
  // Get current workspace ID from localStorage or user's first workspace
  const getCurrentWorkspaceId = () => {
    const stored = localStorage.getItem('currentWorkspaceId')
    if (stored) return stored
    return user?.workspaces?.[0]?.id
  }
  
  const currentWorkspaceId = getCurrentWorkspaceId()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-80 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="relative flex-1">
              <WorkspaceSwitcher currentWorkspaceId={currentWorkspaceId} />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 ml-4"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          {/* Mobile Sidebar Footer - User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.avatarUrl && user.avatarUrl.trim() !== '' ? (
                  <>
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div
                      className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <UserIcon className="h-6 w-6 text-primary-600" />
                    </div>
                  </>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-primary-600" />
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <div className="relative flex-1">
              <WorkspaceSwitcher currentWorkspaceId={currentWorkspaceId} />
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          {/* Desktop Sidebar Footer - User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.avatarUrl && user.avatarUrl.trim() !== '' ? (
                  <>
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div
                      className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <UserIcon className="h-6 w-6 text-primary-600" />
                    </div>
                  </>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-primary-600" />
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Connection status */}
              <div className="flex items-center gap-x-2">
                <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-gray-500">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
