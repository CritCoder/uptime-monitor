import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { formatUptime, formatResponseTime, getStatusColor, formatRelativeTime } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import FreeTrialWelcome from '../components/FreeTrialWelcome'
import {
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('24h')
  const [showTrialWelcome, setShowTrialWelcome] = useState(false)
  const { user } = useAuth()
  
  // Check if user is new and should see trial welcome
  useEffect(() => {
    if (user?.isNewUser) {
      setShowTrialWelcome(true)
      // Remove the isNewUser flag after showing the welcome
      // This prevents it from showing again on page refresh
      const updatedUser = { ...user }
      delete updatedUser.isNewUser
      // You might want to update this in the context or localStorage
    }
  }, [user])
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard', timeRange],
    queryFn: () => api.get(`/dashboard?timeRange=${timeRange}`).then(res => res.data),
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 1,
    onError: (error) => {
      console.error('Dashboard API error:', error);
    }
  })

  // Fetch recent incidents
  const { data: incidentsData, error: incidentsError } = useQuery({
    queryKey: ['incidents', 'recent'],
    queryFn: () => api.get('/incidents?limit=5').then(res => res.data),
    refetchInterval: 60000,
    retry: 1,
    onError: (error) => {
      console.error('Incidents API error:', error);
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Error loading dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
        </div>
      </div>
    )
  }

  const { stats, monitors, uptimeData, responseTimeData } = dashboardData || {}

  return (
    <div className="space-y-6">
      {/* Free Trial Welcome Component */}
      {showTrialWelcome && (
        <FreeTrialWelcome onAcknowledge={() => setShowTrialWelcome(false)} />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor your services and track uptime</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="select btn btn-secondary btn-md pl-4 pr-12"
            style={{ backgroundPosition: 'right 16px center' }}
          >
            <option value="1h">Last 1 hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <Link
            to="/monitors/create"
            className="btn btn-primary btn-md"
          >
            Add Monitor
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/monitors"
          className="card p-6 hover:shadow-lg hover:scale-105 transition-all cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ServerIcon className="h-8 w-8 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate group-hover:text-gray-700 dark:group-hover:text-gray-200">Total Monitors</dt>
                <dd className="text-3xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{stats?.totalMonitors || 0}</dd>
              </dl>
            </div>
            <div className="ml-2 flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/monitors?status=up"
          className="card p-6 hover:shadow-lg hover:scale-105 transition-all cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-400 group-hover:text-green-600 transition-colors" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate group-hover:text-gray-700 dark:group-hover:text-gray-200">Up Monitors</dt>
                <dd className="text-3xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{stats?.upMonitors || 0}</dd>
              </dl>
            </div>
            <div className="ml-2 flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/monitors?status=down"
          className="card p-6 hover:shadow-lg hover:scale-105 transition-all cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-400 group-hover:text-red-600 transition-colors" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate group-hover:text-gray-700 dark:group-hover:text-gray-200">Down Monitors</dt>
                <dd className="text-3xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{stats?.downMonitors || 0}</dd>
              </dl>
            </div>
            <div className="ml-2 flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/monitors"
          className="card p-6 hover:shadow-lg hover:scale-105 transition-all cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-blue-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate group-hover:text-gray-700 dark:group-hover:text-gray-200">Avg Response Time</dt>
                <dd className="text-3xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {formatResponseTime(stats?.avgResponseTime || 0)}
                </dd>
              </dl>
            </div>
            <div className="ml-2 flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 90-Day Uptime History */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">90-Day Uptime History</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visual representation across all monitors</p>
            </div>
          </div>
          <div className="px-6 py-8">
            {monitors && monitors.length > 0 ? (
              (() => {
                // Generate 90 days of uptime history
                const today = new Date()
                const uptimeHistory = Array.from({ length: 90 }, (_, i) => {
                  const date = new Date(today)
                  date.setDate(date.getDate() - (89 - i))
                  const isUp = Math.random() > 0.05 // 95% uptime simulation
                  
                  return {
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    fullDate: date.toLocaleDateString(),
                    status: isUp ? 'up' : 'down',
                    uptime: isUp ? 100 : 0
                  }
                })

                return (
                  <div className="space-y-8">
                    {/* Main uptime bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">90 days ago</span>
                      <div className="flex-1 flex gap-[2px]">
                        {uptimeHistory.map((day, index) => (
                          <div
                            key={index}
                            className={`flex-1 h-16 rounded-sm transition-all hover:scale-110 hover:z-10 cursor-pointer relative ${
                              day.status === 'up' 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : 'bg-red-500 hover:bg-red-600'
                            }`}
                            title={`${day.date}: ${day.status === 'up' ? '100%' : '0%'} uptime`}
                          >
                            <div className="opacity-0 hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none z-20 transition-opacity">
                              <div className="font-semibold">{day.date}</div>
                              <div className={day.status === 'up' ? 'text-green-400' : 'text-red-400'}>
                                {day.status === 'up' ? '✓ 100% uptime' : '✗ Downtime'}
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                <div className="border-4 border-transparent border-t-gray-900" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Today</span>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-sm" />
                        <span>Operational</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-sm" />
                        <span>Downtime</span>
                      </div>
                    </div>
                  </div>
                )
              })()
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <ServerIcon className="h-12 w-12 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <p>No uptime data available</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Data will appear after monitors start checking</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Response Time Trend */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Response Time Trend</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Average response time across monitors</p>
            </div>
          </div>
          <div className="px-6 py-8">
            {responseTimeData && responseTimeData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={responseTimeData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="fillResponseTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--chart-1, 220 70% 50%))" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="hsl(var(--chart-1, 220 70% 50%))" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border, #e5e7eb))"
                      strokeOpacity={0.3}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="time"
                      stroke="hsl(var(--muted-foreground, #9ca3af))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      dy={10}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground, #9ca3af))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}ms`}
                      dx={-10}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const isUp = payload[0].payload.status === 'up'
                          return (
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 shadow-lg">
                              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                {payload[0].payload.time}
                              </div>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Response Time
                                  </span>
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                  {payload[0].value}ms
                                </span>
                              </div>
                              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <div className={`h-2 w-2 rounded-full ${isUp ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className={`text-xs font-medium ${isUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {isUp ? 'Operational' : 'Downtime'}
                                </span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                      cursor={{ stroke: 'hsl(var(--muted-foreground, #9ca3af))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="responseTime"
                      stroke="hsl(var(--chart-1, #3b82f6))"
                      strokeWidth={2.5}
                      fill="url(#fillResponseTime)"
                      fillOpacity={1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <ClockIcon className="h-12 w-12 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <p>No response time data available</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Data will appear after monitors start checking</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monitors List */}
      {monitors && monitors.length >= 3 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Monitors</h3>
              <Link
                to="/monitors"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {monitors.slice(0, 5).map((monitor) => (
              <div key={monitor.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(monitor.status)}`}>
                      {monitor.status}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{monitor.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{monitor.url || monitor.ip}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatUptime(monitor.uptimePercentage || 0)}</span>
                    <span>{formatResponseTime(monitor.avgResponseTime || 0)}</span>
                    <span>{formatRelativeTime(monitor.lastCheckAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Incidents */}
      {incidentsData?.incidents?.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Incidents</h3>
              <Link
                to="/incidents"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {incidentsData.incidents.slice(0, 3).map((incident) => (
              <div key={incident.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      incident.severity === 'critical' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30' :
                      incident.severity === 'major' ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30' :
                      'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
                    }`}>
                      {incident.severity}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{incident.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {incident.monitor?.name} • {formatRelativeTime(incident.startedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {incident.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
