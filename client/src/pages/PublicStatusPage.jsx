import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { formatUptime, getStatusColor } from '../lib/utils'
import LoadingSpinner from '../components/LoadingSpinner'

export default function PublicStatusPage() {
  const { slug } = useParams()
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-status-page', slug],
    queryFn: () => api.get(`/status-pages/public/${slug}`).then(res => res.data),
    enabled: !!slug,
    retry: 1
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Status Page Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error?.response?.data?.error || 'The requested status page could not be found.'}
          </p>
        </div>
      </div>
    )
  }

  const { statusPage, monitors, incidents, stats } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              {statusPage.logoUrl && (
                <img
                  src={statusPage.logoUrl}
                  alt="Logo"
                  className="h-8 w-8 mr-3"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-900">{statusPage.name}</h1>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Overview */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
              <div className="text-2xl font-bold text-green-600">
                {formatUptime(stats.avgUptime)}
              </div>
            </div>
            <p className="text-gray-600">
              {stats.upMonitors} of {stats.totalMonitors} services operational
            </p>
          </div>
        </div>

        {/* Services */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
          <div className="bg-white rounded-lg shadow">
            {monitors.map((monitor) => (
              <div key={monitor.id} className="px-6 py-4 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(monitor.status)}`}>
                      {monitor.status}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{monitor.name}</h4>
                      <p className="text-sm text-gray-500">{monitor.type}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatUptime(monitor.uptimePercentage)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        {incidents && incidents.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h3>
            <div className="bg-white rounded-lg shadow">
              {incidents.map((incident) => (
                <div key={incident.id} className="px-6 py-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{incident.title}</h4>
                      <p className="text-sm text-gray-500">
                        {incident.monitor?.name} • {new Date(incident.startedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      incident.severity === 'critical' ? 'text-red-600 bg-red-50' :
                      incident.severity === 'major' ? 'text-orange-600 bg-orange-50' :
                      'text-yellow-600 bg-yellow-50'
                    }`}>
                      {incident.severity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
