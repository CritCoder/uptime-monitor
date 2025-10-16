import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { PlusIcon, ServerIcon, ChartBarIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '../components/Empty'

export default function StatusPagesPage() {
  const [page, setPage] = useState(1)
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['status-pages', page],
    queryFn: () => api.get(`/status-pages?page=${page}`).then(res => res.data),
    refetchInterval: 60000,
    retry: 1,
    onError: (error) => {
      console.error('Status Pages API error:', error);
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading status pages...</p>
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
              <ServerIcon className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading status pages</h2>
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
                Status Pages
              </h1>
              <p className="text-xl text-gray-600 mt-4">
                Create and manage public status pages for your services
              </p>
            </div>
            <Link
              to="/status-pages/create"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <PlusIcon className="h-5 w-5" />
                <span>Create Status Page</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </div>

      {/* Status Pages Content */}
      <div className="max-w-7xl mx-auto py-8">
        {!data?.statusPages?.length ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 border border-white/20 shadow-lg text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ServerIcon className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No status pages found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by creating your first public status page to keep your users informed.
            </p>
            <Link
              to="/status-pages/create"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create Your First Status Page</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.statusPages.map((statusPage, index) => (
              <div
                key={statusPage.id}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Status Page Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <ServerIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{statusPage.name}</h3>
                      <p className="text-sm text-gray-500">{statusPage.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusPage.isPublic 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {statusPage.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>

                {/* Status Page Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {statusPage.monitorCount || 0}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Monitors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {statusPage.incidentCount || 0}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Incidents</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Link
                    to={`/status-pages/${statusPage.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>View</span>
                  </Link>
                  <Link
                    to={`/status-pages/${statusPage.id}/edit`}
                    className="text-gray-600 hover:text-gray-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}