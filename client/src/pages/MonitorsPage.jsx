import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { formatUptime, formatResponseTime, getStatusColor, formatRelativeTime } from '../lib/utils'
import { PlusIcon, ServerIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '../components/Empty'

export default function MonitorsPage() {
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  // Read status filter from URL
  useEffect(() => {
    const status = searchParams.get('status')
    if (status) {
      setStatusFilter(status)
    }
  }, [searchParams])

  const { data, isLoading, error } = useQuery({
    queryKey: ['monitors', page, search, statusFilter],
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

  // Filter monitors by status
  const filteredMonitors = data?.monitors?.filter(monitor => {
    if (!statusFilter) return true
    return monitor.status === statusFilter
  }) || []

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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search monitors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === ''
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('up')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'up'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Up
          </button>
          <button
            onClick={() => setStatusFilter('down')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'down'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Down
          </button>
          <button
            onClick={() => setStatusFilter('paused')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'paused'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Paused
          </button>
        </div>
      </div>

      {/* Monitors List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Monitors</h3>
        </div>
        {filteredMonitors.length === 0 ? (
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
            {filteredMonitors.map((monitor) => (
              <Link
                key={monitor.id}
                to={`/monitors/${monitor.slug || monitor.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Screenshot Thumbnail */}
                  {monitor.screenshotUrl ? (
                    <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img 
                        src={monitor.screenshotUrl} 
                        alt={`${monitor.name} screenshot`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
                        <ServerIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-20 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <ServerIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Monitor Info */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{monitor.name}</h4>
                      <p className="text-sm text-gray-500 truncate">{monitor.url || monitor.ip}</p>
                    </div>
                  </div>
                  
                  {/* Monitor Stats */}
                  <div className="flex items-center gap-6 ml-4">
                    <div className="flex items-center justify-center min-w-[80px]">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(monitor.status)}`}>
                        {monitor.status === 'checking' && <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />}
                        {monitor.status === 'checking' ? 'Checking...' : monitor.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="min-w-[60px] text-right">{formatUptime(monitor.uptimePercentage || 0)}</span>
                      <span className="min-w-[50px] text-right">{formatResponseTime(monitor.avgResponseTime || 0)}</span>
                      <span className="min-w-[50px] text-right">{formatRelativeTime(monitor.lastCheckAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
