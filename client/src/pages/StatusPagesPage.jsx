import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { PlusIcon, ServerIcon, ChartBarIcon } from '@heroicons/react/24/outline'
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Error loading status pages</h2>
          <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Status Pages</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage public status pages</p>
        </div>
        <Link to="/status-pages/create" className="btn btn-primary btn-md">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Status Page
        </Link>
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">All Status Pages</h3>
        </div>
        {data?.statusPages?.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ChartBarIcon className="w-16 h-16 text-gray-400" />
              </EmptyMedia>
              <EmptyTitle>No Status Pages</EmptyTitle>
              <EmptyDescription>
                You haven't created any status pages yet.<br />
                Create a public status page to keep your users informed.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                to="/status-pages/create"
                className="btn btn-primary btn-md"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Your First Status Page
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {data?.statusPages?.map((statusPage) => (
            <div key={statusPage.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ServerIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{statusPage.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {statusPage.isPublic ? 'Public' : 'Private'} • 
                      {statusPage.monitors?.length || 0} monitors
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    to={`/status/${statusPage.slug}`}
                    target="_blank"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                  >
                    View
                  </Link>
                  <Link
                    to={`/status-pages/${statusPage.id}`}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                  >
                    Edit
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
