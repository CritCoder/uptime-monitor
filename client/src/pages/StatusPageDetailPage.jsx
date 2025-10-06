import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function StatusPageDetailPage() {
  const { id } = useParams()
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['status-page', id],
    queryFn: () => api.get(`/status-pages/${id}`).then(res => res.data),
    enabled: !!id,
    retry: 1
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error loading status page</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Status Page Details</h1>
      <div className="card p-6">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  )
}
