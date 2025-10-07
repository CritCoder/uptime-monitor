import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { formatUptime, formatResponseTime, getStatusColor, formatRelativeTime } from '../lib/utils'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  ArrowLeftIcon, 
  ServerIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function MonitorDetailPage() {
  const { id } = useParams()
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['monitor', id],
    queryFn: () => api.get(`/monitors/${id}`).then(res => res.data),
    enabled: !!id,
    retry: 1,
    refetchInterval: 30000
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error loading monitor</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  const monitor = data?.monitor

  // Prepare chart data from recent checks
  const responseTimeChartData = monitor?.checks?.slice(0, 20).reverse().map((check, index) => ({
    time: new Date(check.checkedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    responseTime: check.responseTime || 0,
  })) || []

  const uptimeChartData = monitor?.checks?.slice(0, 20).reverse().map((check, index) => ({
    time: new Date(check.checkedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    uptime: check.status === 'up' ? 100 : 0,
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/monitors"
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{monitor?.name}</h1>
            <p className="text-gray-600">{monitor?.url || monitor?.ip}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(monitor?.status)}`}>
            {monitor?.status === 'up' && <CheckCircleIcon className="h-4 w-4 mr-1" />}
            {monitor?.status === 'down' && <XCircleIcon className="h-4 w-4 mr-1" />}
            {monitor?.status}
          </div>
          <Link
            to={`/monitors/${monitor?.slug || id}/edit`}
            className="btn btn-secondary btn-md"
          >
            Edit Monitor
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatUptime(monitor?.uptimePercentage || 0)}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatResponseTime(monitor?.avgResponseTime || 0)}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Check</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                {formatRelativeTime(monitor?.lastCheckAt)}
              </p>
            </div>
            <ServerIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Check Interval</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {monitor?.interval}s
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Monitor Details */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Monitor Configuration</h3>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{monitor?.type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{monitor?.status}</dd>
            </div>
            {monitor?.url && (
              <div>
                <dt className="text-sm font-medium text-gray-500">URL</dt>
                <dd className="mt-1 text-sm text-gray-900">{monitor?.url}</dd>
              </div>
            )}
            {monitor?.ip && (
              <div>
                <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{monitor?.ip}</dd>
              </div>
            )}
            {monitor?.port && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Port</dt>
                <dd className="mt-1 text-sm text-gray-900">{monitor?.port}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">HTTP Method</dt>
              <dd className="mt-1 text-sm text-gray-900">{monitor?.httpMethod || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Expected Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{monitor?.expectedStatus || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Timeout</dt>
              <dd className="mt-1 text-sm text-gray-900">{monitor?.timeout}s</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Retry Count</dt>
              <dd className="mt-1 text-sm text-gray-900">{monitor?.retryCount}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Follow Redirects</dt>
              <dd className="mt-1 text-sm text-gray-900">{monitor?.followRedirects ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Verify SSL</dt>
              <dd className="mt-1 text-sm text-gray-900">{monitor?.verifySsl ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Active</dt>
              <dd className="mt-1 text-sm text-gray-900">{monitor?.isActive ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {monitor?.createdAt ? new Date(monitor.createdAt).toLocaleString() : 'N/A'}
              </dd>
            </div>
            {monitor?.lastUptime && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Uptime</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(monitor.lastUptime).toLocaleString()}
                </dd>
              </div>
            )}
            {monitor?.lastDowntime && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Downtime</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(monitor.lastDowntime).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Charts */}
      {monitor?.checks && monitor.checks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Time Trend */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Response Time Trend</h3>
                <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-500 mt-1">Last 20 checks</p>
            </div>
            <div className="px-6 py-6">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={responseTimeChartData}>
                  <defs>
                    <linearGradient id="colorResponseTime" x1="0" y1="0" x2="0" y2="1">
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
                        return (
                          <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
                            <div className="text-xs text-gray-500 mb-1">{payload[0].payload.time}</div>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {payload[0].value}ms
                              </span>
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
                    fill="url(#colorResponseTime)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Uptime Trend */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Uptime Trend</h3>
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-500 mt-1">Last 20 checks</p>
            </div>
            <div className="px-6 py-6">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={uptimeChartData}>
                  <defs>
                    <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
                            <div className="text-xs text-gray-500 mb-1">{payload[0].payload.time}</div>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {payload[0].value === 100 ? 'Up' : 'Down'}
                              </span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area 
                    type="stepAfter" 
                    dataKey="uptime" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#colorUptime)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Checks */}
      {monitor?.checks && monitor.checks.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Checks</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {monitor.checks.slice(0, 10).map((check) => (
              <div key={check.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {check.status === 'up' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm text-gray-900 capitalize">{check.status}</span>
                  {check.statusCode && (
                    <span className="text-sm text-gray-500">Status: {check.statusCode}</span>
                  )}
                  {check.responseTime && (
                    <span className="text-sm text-gray-500">
                      Response: {check.responseTime}ms
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(check.checkedAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
