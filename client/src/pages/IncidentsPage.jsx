import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { formatRelativeTime, getSeverityColor } from '../lib/utils'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '../components/Empty'

export default function IncidentsPage() {
  const [page, setPage] = useState(1)
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['incidents', page],
    queryFn: () => api.get(`/incidents?page=${page}`).then(res => res.data),
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
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error loading incidents</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
        <p className="text-gray-600">Track and manage service incidents</p>
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Incidents</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {data?.incidents?.map((incident) => (
            <div key={incident.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{incident.title}</h4>
                    <p className="text-sm text-gray-500">
                      {incident.monitor?.name} • {formatRelativeTime(incident.startedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{incident.status}</span>
                  <Link
                    to={`/incidents/${incident.id}`}
                    className="text-primary-600 hover:text-primary-500"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
