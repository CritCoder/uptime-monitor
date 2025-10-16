import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { formatUptime, formatResponseTime, getStatusColor, formatRelativeTime } from '../lib/utils'
import { 
  PlusIcon, 
  ServerIcon, 
  ArrowPathIcon, 
  EyeIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '../components/Empty'

export default function MonitorsPage() {
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [screenshots, setScreenshots] = useState({})
  const [loadingScreenshots, setLoadingScreenshots] = useState({})
  
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

  // Fetch screenshot for a monitor
  const fetchScreenshot = async (monitorId) => {
    if (screenshots[monitorId] || loadingScreenshots[monitorId]) return;
    
    setLoadingScreenshots(prev => ({ ...prev, [monitorId]: true }));
    
    try {
      const response = await api.get(`/monitors/${monitorId}/screenshot`);
      setScreenshots(prev => ({ 
        ...prev, 
        [monitorId]: response.data.screenshot 
      }));
    } catch (error) {
      console.error('Failed to fetch screenshot:', error);
    } finally {
      setLoadingScreenshots(prev => ({ ...prev, [monitorId]: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'up':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'down':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'paused':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    switch (status) {
      case 'up':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'down':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'paused':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading monitors...</p>
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
              <XCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading monitors</h2>
            <p className="text-gray-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Monitors
              </h1>
              <p className="text-xl text-gray-600 mt-4">
                Monitor your websites and APIs with real-time insights
              </p>
            </div>
            <Link
              to="/monitors/create"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <PlusIcon className="h-5 w-5" />
                <span>Add Monitor</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto py-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search monitors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            {/* Status Filters */}
            <div className="flex gap-2">
              {[
                { key: '', label: 'All', count: data?.total || 0 },
                { key: 'up', label: 'Up', count: data?.monitors?.filter(m => m.status === 'up').length || 0 },
                { key: 'down', label: 'Down', count: data?.monitors?.filter(m => m.status === 'down').length || 0 },
                { key: 'paused', label: 'Paused', count: data?.monitors?.filter(m => m.status === 'paused').length || 0 }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    statusFilter === filter.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monitors Grid */}
      <div className="max-w-7xl mx-auto pb-16">
        {!data?.monitors?.length ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 border border-white/20 shadow-lg text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ServerIcon className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No monitors found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by adding your first monitor to track your websites and APIs.
            </p>
            <Link
              to="/monitors/create"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Your First Monitor</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.monitors.map((monitor, index) => (
              <div
                key={monitor.id}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Monitor Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <ServerIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{monitor.name}</h3>
                      <p className="text-sm text-gray-500 truncate max-w-48">{monitor.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(monitor.status)}
                    <span className={getStatusBadge(monitor.status)}>
                      {monitor.status}
                    </span>
                  </div>
                </div>

                {/* Screenshot Section */}
                <div className="mb-4">
                  <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-video">
                    {screenshots[monitor.id] ? (
                      <img
                        src={`data:image/png;base64,${screenshots[monitor.id]}`}
                        alt={`Screenshot of ${monitor.url}`}
                        className="w-full h-full object-cover"
                      />
                    ) : loadingScreenshots[monitor.id] ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <button
                          onClick={() => fetchScreenshot(monitor.id)}
                          className="flex flex-col items-center space-y-2 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <EyeIcon className="h-8 w-8" />
                          <span className="text-sm font-medium">View Screenshot</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatUptime(monitor.uptime)}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatResponseTime(monitor.avgResponseTime)}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatRelativeTime(monitor.lastCheck)}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Last Check</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Link
                    to={`/monitors/${monitor.slug}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <ChartBarIcon className="h-4 w-4" />
                    <span>View Details</span>
                  </Link>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <ArrowPathIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}