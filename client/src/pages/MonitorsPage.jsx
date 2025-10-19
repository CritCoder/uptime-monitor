import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { formatUptime, formatResponseTime, getStatusColor, formatRelativeTime } from '../lib/utils'
import { PlusIcon, ServerIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '../components/Empty'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/motion-tabs'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'

export default function MonitorsPage() {
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const navigate = useNavigate()
  
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
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Error loading monitors</h2>
          <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
        </div>
      </div>
    )
  }

  // Filter monitors by status
  const filteredMonitors = data?.monitors?.filter(monitor => {
    if (!statusFilter) return true
    return monitor.status === statusFilter
  }) || []

  // Keyboard shortcuts
  useKeyboardShortcut('k', () => navigate('/monitors/create'), { meta: true, ctrl: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Monitors</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your monitoring targets</p>
        </div>
        <Link
          to="/monitors/create"
          className="btn btn-primary btn-md flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Monitor</span>
          <span className="hidden sm:inline-flex items-center gap-1 ml-1">
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-white bg-primary-700 border border-primary-600 rounded">⌘K</kbd>
          </span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="order-2 sm:order-1"
        >
          <TabsList className="bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="" className="text-gray-700 dark:text-gray-300">All</TabsTrigger>
            <TabsTrigger value="up" className="text-gray-700 dark:text-gray-300">Up</TabsTrigger>
            <TabsTrigger value="down" className="text-gray-700 dark:text-gray-300">Down</TabsTrigger>
            <TabsTrigger value="paused" className="text-gray-700 dark:text-gray-300">Paused</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="max-w-md sm:max-w-xs order-1 sm:order-2">
          <input
            type="text"
            placeholder="Search monitors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full"
          />
        </div>
      </div>

      {/* Monitors List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">All Monitors</h3>
        </div>
        {filteredMonitors.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <ServerIcon className="w-16 h-16 text-gray-400" />
              </EmptyMedia>
              <EmptyTitle>No Monitors Yet</EmptyTitle>
              <EmptyDescription>
                Get started by creating your first monitor.
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
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredMonitors.map((monitor) => (
              <Link
                key={monitor.id}
                to={`/monitors/${monitor.slug || monitor.id}`}
                className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Screenshot Thumbnail */}
                  {monitor.screenshotUrl ? (
                    <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
                    <div className="flex-shrink-0 w-20 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      <ServerIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Monitor Info */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{monitor.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{monitor.url || monitor.ip}</p>
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
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
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
