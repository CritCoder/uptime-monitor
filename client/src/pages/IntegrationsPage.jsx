import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { toast } from 'sonner'
import { PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

const INTEGRATION_TYPES = [
  {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    description: 'Real-time alerts in your channels',
    color: 'from-purple-500 to-pink-500',
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...' },
      { name: 'channel', label: 'Channel', type: 'text', placeholder: '#alerts' }
    ]
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    description: 'Monitor notifications for your team',
    color: 'from-indigo-500 to-blue-500',
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://discord.com/api/webhooks/...' }
    ]
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty',
    icon: '📟',
    description: 'On-call incident management',
    color: 'from-green-500 to-emerald-500',
    fields: [
      { name: 'integrationKey', label: 'Integration Key', type: 'text', placeholder: 'Your PagerDuty integration key' }
    ]
  },
  {
    id: 'webhook',
    name: 'Webhook',
    icon: '🔗',
    description: 'Custom integrations',
    color: 'from-orange-500 to-red-500',
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://your-endpoint.com/webhook' },
      { name: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'GET', 'PUT'] }
    ]
  }
]

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState(null)
  const [formData, setFormData] = useState({})
  const [testingIntegration, setTestingIntegration] = useState(null)
  const queryClient = useQueryClient()

  // Fetch integrations
  const { data, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.get('/integrations').then(res => res.data),
    retry: 1
  })

  // Create integration mutation
  const createMutation = useMutation({
    mutationFn: (integration) => api.post('/integrations', integration),
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations'])
      toast.success('Integration added successfully!')
      setSelectedIntegration(null)
      setFormData({})
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add integration')
    }
  })

  // Delete integration mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/integrations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations'])
      toast.success('Integration removed successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to remove integration')
    }
  })

  // Test integration mutation
  const testMutation = useMutation({
    mutationFn: (id) => api.post(`/integrations/${id}/test`),
    onSuccess: () => {
      toast.success('Test notification sent successfully!')
      setTestingIntegration(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to send test notification')
      setTestingIntegration(null)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedIntegration) return

    const integration = {
      type: selectedIntegration.id,
      name: `${selectedIntegration.name} Integration`,
      config: formData,
      enabled: true
    }

    createMutation.mutate(integration)
  }

  const handleTest = (integrationId) => {
    setTestingIntegration(integrationId)
    testMutation.mutate(integrationId)
  }

  const integrationConfig = selectedIntegration 
    ? INTEGRATION_TYPES.find(t => t.id === selectedIntegration.id)
    : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600">Connect with your favorite tools</p>
      </div>

      {/* Integration Types Grid */}
      {!selectedIntegration && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INTEGRATION_TYPES.map((integration) => {
            const existingIntegrations = data?.integrations?.filter(i => i.type === integration.id) || []
            
            return (
              <div
                key={integration.id}
                className="card p-6 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedIntegration(integration)}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {integration.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{integration.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                
                {existingIntegrations.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">
                      {existingIntegrations.length} active
                    </span>
                  </div>
                )}
                
                <button className="mt-4 w-full btn btn-primary btn-sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Integration
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Integration Form */}
      {selectedIntegration && integrationConfig && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${integrationConfig.color} flex items-center justify-center text-2xl`}>
                {integrationConfig.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add {integrationConfig.name}</h2>
                <p className="text-sm text-gray-600">{integrationConfig.description}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedIntegration(null)
                setFormData({})
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {integrationConfig.fields.map((field) => (
              <div key={field.name}>
                <label className="label">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    className="select"
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    required
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    className="input"
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    required
                  />
                )}
              </div>
            ))}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createMutation.isLoading}
                className="btn btn-primary btn-md"
              >
                {createMutation.isLoading ? 'Adding...' : 'Add Integration'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedIntegration(null)
                  setFormData({})
                }}
                className="btn btn-secondary btn-md"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Integrations */}
      {!selectedIntegration && data?.integrations?.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Active Integrations</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {data.integrations.map((integration) => {
              const type = INTEGRATION_TYPES.find(t => t.id === integration.type)
              
              return (
                <div key={integration.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type?.color} flex items-center justify-center text-xl`}>
                      {type?.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{integration.name}</h4>
                      <p className="text-sm text-gray-500">{type?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleTest(integration.id)}
                      disabled={testingIntegration === integration.id}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {testingIntegration === integration.id ? 'Testing...' : 'Test'}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(integration.id)}
                      disabled={deleteMutation.isLoading}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

