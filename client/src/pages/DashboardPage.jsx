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
  ArrowDownIcon,
  ChartBarIcon,
  EyeIcon
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading dashboard</h2>
            <p className="text-gray-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  const stats = dashboardData?.stats || {}
  const uptimeHistory = dashboardData?.uptimeHistory || []
  const responseTimeHistory = dashboardData?.responseTimeHistory || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-xl text-gray-600 mt-4">
                Monitor your infrastructure health and performance
              </p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-xl p-2 border border-white/20">
              {[
                { key: '24h', label: '24h' },
                { key: '7d', label: '7d' },
                { key: '30d', label: '30d' },
                { key: '90d', label: '90d' }
              ].map((range) => (
                <button
                  key={range.key}
                  onClick={() => setTimeRange(range.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    timeRange === range.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/80'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Monitors */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Monitors</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMonitors || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <ServerIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Up Monitors */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Up Monitors</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.upMonitors || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Down Monitors */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Down Monitors</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.downMonitors || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Average Response Time */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Avg Response</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatResponseTime(stats.avgResponseTime)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="max-w-7xl mx-auto pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Uptime History */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">90-Day Uptime History</h3>
              <p className="text-sm text-gray-600">Overall system availability over time</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uptimeHistory}>
                  <defs>
                    <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${value}%`, 'Uptime']}
                  />
                  <Area
                    type="monotone"
                    dataKey="uptime"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#uptimeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Downtime</span>
              </div>
            </div>
          </div>

          {/* Response Time Trend */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Response Time Trend</h3>
              <p className="text-sm text-gray-600">Average response times over the last 24 hours</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeHistory}>
                  <defs>
                    <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}ms`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${value}ms`, 'Response Time']}
                  />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      {incidentsData?.incidents?.length > 0 && (
        <div className="max-w-7xl mx-auto pb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Recent Incidents</h3>
                <p className="text-sm text-gray-600">Latest system incidents and alerts</p>
              </div>
              <Link
                to="/incidents"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowUpIcon className="h-4 w-4 rotate-45" />
              </Link>
            </div>
            <div className="space-y-4">
              {incidentsData.incidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      incident.status === 'resolved' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{incident.title}</p>
                      <p className="text-sm text-gray-600">{incident.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatRelativeTime(incident.createdAt)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{incident.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}