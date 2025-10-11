import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { formatRelativeTime } from '../lib/utils'

export default function IncidentDetailPage() {
  const { id } = useParams()
  const [aiSummary, setAiSummary] = useState('')
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => api.get(`/incidents/${id}`).then(res => res.data),
    enabled: !!id,
    retry: 1
  })

  // Generate AI summary when incident data loads
  useEffect(() => {
    if (data?.incident && !aiSummary) {
      generateAISummary(data.incident)
    }
  }, [data])

  const generateAISummary = async (incident) => {
    setIsGeneratingSummary(true)
    try {
      const response = await api.post('/incidents/generate-summary', {
        incidentId: incident.id
      })

      if (response.data?.summary) {
        setAiSummary(response.data.summary)
      } else {
        setAiSummary('Unable to generate summary at this time.')
      }
    } catch (error) {
      console.error('Error generating AI summary:', error)
      setAiSummary('Unable to generate summary at this time.')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error loading incident</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  const { incident } = data || {}
  if (!incident) return null

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'major': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'minor': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200'
      case 'investigating': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'identified': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'monitoring': return 'text-indigo-600 bg-indigo-50 border-indigo-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link 
        to="/incidents" 
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Incidents
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{incident.title}</h1>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(incident.severity)}`}>
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {incident.severity}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(incident.status)}`}>
                {incident.status === 'resolved' ? (
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ClockIcon className="h-4 w-4 mr-1" />
                )}
                {incident.status}
              </span>
            </div>
          </div>
        </div>

        {/* Monitor Info */}
        {incident.monitor && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Affected Monitor</div>
            <div className="mt-1 font-medium text-gray-900">{incident.monitor.name}</div>
            {incident.monitor.url && (
              <div className="text-sm text-gray-500 mt-1">{incident.monitor.url}</div>
            )}
          </div>
        )}
      </div>

      {/* AI Summary */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">What Happened?</h2>
          <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">AI Summary</span>
        </div>
        {isGeneratingSummary ? (
          <div className="flex items-center gap-3 text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            <span>Generating easy-to-understand summary...</span>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">{aiSummary}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Incident Started</div>
              <div className="text-sm text-gray-500">
                {new Date(incident.startedAt).toLocaleString()} ({formatRelativeTime(incident.startedAt)})
              </div>
            </div>
          </div>

          {incident.updates && incident.updates.length > 0 && incident.updates.map((update, index) => (
            <div key={update.id} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 capitalize">{update.status}</div>
                <div className="text-sm text-gray-700 mt-1">{update.message}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(update.createdAt).toLocaleString()} ({formatRelativeTime(update.createdAt)})
                </div>
              </div>
            </div>
          ))}

          {incident.resolvedAt && (
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Incident Resolved</div>
                <div className="text-sm text-gray-500">
                  {new Date(incident.resolvedAt).toLocaleString()} ({formatRelativeTime(incident.resolvedAt)})
                </div>
                {incident.startedAt && incident.resolvedAt && (
                  <div className="text-sm text-gray-500 mt-1">
                    Duration: {Math.round((new Date(incident.resolvedAt) - new Date(incident.startedAt)) / 1000 / 60)} minutes
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
