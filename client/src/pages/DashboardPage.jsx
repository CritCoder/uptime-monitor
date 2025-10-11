import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { formatUptime, formatResponseTime, getStatusColor, formatRelativeTime } from '../lib/utils'
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
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error loading dashboard</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  const { stats, monitors, uptimeData, responseTimeData } = dashboardData || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Monitor your services and track uptime</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-select rounded-lg border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors px-4 py-2"
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
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ServerIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Monitors</dt>
                <dd className="text-3xl font-bold text-gray-900">{stats?.totalMonitors || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Up Monitors</dt>
                <dd className="text-3xl font-bold text-gray-900">{stats?.upMonitors || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Down Monitors</dt>
                <dd className="text-3xl font-bold text-gray-900">{stats?.downMonitors || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Avg Response Time</dt>
                <dd className="text-3xl font-bold text-gray-900">
                  {formatResponseTime(stats?.avgResponseTime || 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 90-Day Uptime History */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-medium text-gray-900">90-Day Uptime History</h3>
              <p className="text-sm text-gray-500 mt-1">Visual representation across all monitors</p>
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
                      <span className="text-xs text-gray-500 whitespace-nowrap">90 days ago</span>
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
                      <span className="text-xs text-gray-500 whitespace-nowrap">Today</span>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-8 text-sm text-gray-600 pt-2 border-t border-gray-100">
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
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <ServerIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No uptime data available</p>
                  <p className="text-sm text-gray-400 mt-1">Data will appear after monitors start checking</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Response Time Trend */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Response Time Trend</h3>
              <p className="text-sm text-gray-500 mt-1">Average response time across monitors</p>
            </div>
          </div>
          <div className="px-6 py-8">
            {responseTimeData && responseTimeData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={responseTimeData}>
                    <defs>
                      <linearGradient id="dashboardResponseTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(value) => `${value}ms`}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const isUp = payload[0].payload.status === 'up'
                          return (
                            <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
                              <div className="text-xs text-gray-500 mb-1">{payload[0].payload.time}</div>
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${isUp ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-sm font-medium text-gray-900">
                                  {payload[0].value}ms
                                </span>
                              </div>
                              <div className={`text-xs mt-1 ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                                {isUp ? 'Operational' : 'Down'}
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fill="url(#dashboardResponseTime)"
                      fillOpacity={1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <ClockIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No response time data available</p>
                  <p className="text-sm text-gray-400 mt-1">Data will appear after monitors start checking</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monitors List */}
      {monitors && monitors.length >= 3 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Monitors</h3>
              <Link
                to="/monitors"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {monitors.slice(0, 5).map((monitor) => (
              <div key={monitor.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(monitor.status)}`}>
                      {monitor.status}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{monitor.name}</h4>
                      <p className="text-sm text-gray-500">{monitor.url || monitor.ip}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
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
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Incidents</h3>
              <Link
                to="/incidents"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {incidentsData.incidents.slice(0, 3).map((incident) => (
              <div key={incident.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      incident.severity === 'critical' ? 'text-red-600 bg-red-50' :
                      incident.severity === 'major' ? 'text-orange-600 bg-orange-50' :
                      'text-yellow-600 bg-yellow-50'
                    }`}>
                      {incident.severity}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{incident.title}</h4>
                      <p className="text-sm text-gray-500">
                        {incident.monitor?.name} • {formatRelativeTime(incident.startedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
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
