import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { formatUptime, getStatusColor } from '../lib/utils'
import LoadingSpinner from '../components/LoadingSpinner'
import { CheckCircleIcon, XCircleIcon, ClockIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export default function PublicStatusPage() {
  const { slug } = useParams()
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-status-page', slug],
    queryFn: () => api.get(`/status-pages/public/${slug}`).then(res => res.data),
    enabled: !!slug,
    retry: 1,
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Status Page Not Found</h1>
          <p className="text-gray-600">
            {error?.response?.data?.error || 'The requested status page could not be found.'}
          </p>
        </div>
      </div>
    )
  }

  const { statusPage, monitors, incidents, stats } = data
  const isAllOperational = stats.downMonitors === 0 && stats.totalMonitors > 0
  const hasIssues = stats.downMonitors > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {statusPage.logoUrl && (
                <img
                  src={statusPage.logoUrl}
                  alt="Logo"
                  className="h-12 w-12 object-contain"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{statusPage.name}</h1>
                {statusPage.description && (
                  <p className="text-gray-600 mt-1">{statusPage.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Overall Status Banner */}
        <div className={`rounded-2xl p-8 mb-8 ${
          isAllOperational 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
            : hasIssues 
            ? 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200'
            : 'bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isAllOperational ? (
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              ) : hasIssues ? (
                <XCircleIcon className="h-12 w-12 text-red-600" />
              ) : (
                <ClockIcon className="h-12 w-12 text-gray-600" />
              )}
              <div>
                <h2 className={`text-2xl font-bold ${
                  isAllOperational ? 'text-green-900' : hasIssues ? 'text-red-900' : 'text-gray-900'
                }`}>
                  {isAllOperational 
                    ? 'All Systems Operational' 
                    : hasIssues 
                    ? 'Experiencing Issues'
                    : 'No Services Configured'
                  }
                </h2>
                <p className={`text-sm mt-1 ${
                  isAllOperational ? 'text-green-700' : hasIssues ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {stats.upMonitors} of {stats.totalMonitors} services operational
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${
                isAllOperational ? 'text-green-600' : hasIssues ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stats.avgUptime.toFixed(2)}%
              </div>
              <p className="text-sm text-gray-600 mt-1">Uptime</p>
            </div>
          </div>
        </div>

        {/* Services Status */}
        {monitors && monitors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Service Status</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-200">
              {monitors.map((monitor) => {
                // Generate 90 days of uptime history (mock data for now)
                const today = new Date()
                const uptimeHistory = Array.from({ length: 90 }, (_, i) => {
                  const date = new Date(today)
                  date.setDate(date.getDate() - (89 - i))
                  const isUp = Math.random() > 0.05 // 95% uptime simulation
                  const uptime = isUp ? 100 : 0
                  
                  return {
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    status: isUp ? 'up' : 'down',
                    uptime: uptime
                  }
                })

                return (
                  <div key={monitor.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-3 h-3 rounded-full ${
                          monitor.status === 'up' ? 'bg-green-500' :
                          monitor.status === 'down' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900">{monitor.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{monitor.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {monitor.uptimePercentage ? monitor.uptimePercentage.toFixed(2) : 0}%
                          </div>
                          <div className="text-xs text-gray-500">Uptime</div>
                        </div>
                        {monitor.avgResponseTime && (
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">
                              {monitor.avgResponseTime}ms
                            </div>
                            <div className="text-xs text-gray-500">Latency</div>
                          </div>
                        )}
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          monitor.status === 'up' 
                            ? 'bg-green-100 text-green-800' 
                            : monitor.status === 'down'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {monitor.status === 'up' ? 'Operational' : monitor.status === 'down' ? 'Down' : 'Unknown'}
                        </div>
                      </div>
                    </div>

                    {/* Uptime History Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-16">90 days ago</span>
                      <div className="flex-1 flex gap-[2px] group">
                        {uptimeHistory.map((day, index) => (
                          <div
                            key={index}
                            className={`flex-1 h-10 rounded-sm transition-all hover:scale-110 hover:z-10 cursor-pointer relative ${
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
                      <span className="text-xs text-gray-500 w-12">Today</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Incidents */}
        {incidents && incidents.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Incidents</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-200">
              {incidents.map((incident) => (
                <div key={incident.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          incident.severity === 'major' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {incident.severity}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(incident.startedAt).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-gray-900 mb-1">
                        {incident.title || `${incident.monitor?.name} Incident`}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {incident.monitor?.name}
                      </p>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Footer - Fixed at bottom */}
      <footer className="mt-auto bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()} • Auto-refreshes every 30 seconds
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Powered by Uptime Monitor
          </p>
        </div>
      </footer>
    </div>
  )
}
