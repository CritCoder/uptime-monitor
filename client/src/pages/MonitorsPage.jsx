import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { formatUptime, formatResponseTime, getStatusColor, formatRelativeTime } from '../lib/utils'
import { PlusIcon, ServerIcon } from '@heroicons/react/24/outline'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '../components/Empty'

export default function MonitorsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['monitors', page, search],
    queryFn: () => api.get(`/monitors?page=${page}&search=${search}`).then(res => res.data),
    refetchInterval: 30000,
    retry: 1,
    onError: (error) => {
      console.error('Monitors API error:', error);
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
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error loading monitors</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitors</h1>
          <p className="text-gray-600">Manage your monitoring targets</p>
        </div>
        <Link
          to="/monitors/create"
          className="btn btn-primary btn-md"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Monitor
        </Link>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search monitors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
      </div>

      {/* Monitors List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Monitors</h3>
        </div>
        {data?.monitors?.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <ServerIcon className="w-16 h-16 text-gray-400" />
              </EmptyMedia>
              <EmptyTitle>No Monitors Yet</EmptyTitle>
              <EmptyDescription>
                You haven't created any monitors yet. Get started by creating your first monitor to track uptime and performance.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                to="/monitors/create"
                className="btn btn-primary btn-md"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Your First Monitor
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="divide-y divide-gray-200">
            {data?.monitors?.map((monitor) => (
              <div key={monitor.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ServerIcon className="h-5 w-5 text-gray-400" />
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
                    <Link
                      to={`/monitors/${monitor.id}`}
                      className="text-primary-600 hover:text-primary-500"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
