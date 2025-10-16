import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { toast } from 'sonner'
import { PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useLogoSearch } from '../hooks/useLogoSearch'

const INTEGRATION_TYPES = [
  {
    id: 'slack',
    name: 'Slack',
    companyName: 'Slack',
    icon: '💬',
    description: 'Real-time alerts in your channels',
    color: 'from-purple-500 to-pink-500',
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...', required: true },
      { name: 'channel', label: 'Channel', type: 'text', placeholder: '#alerts', required: false }
    ]
  },
  {
    id: 'webhook',
    name: 'Webhook',
    companyName: 'Custom',
    icon: '🔗',
    description: 'Custom integrations and notifications',
    color: 'from-orange-500 to-red-500',
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://your-endpoint.com/webhook', required: true },
      { name: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'GET', 'PUT'], required: false }
    ]
  }
]

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState(null)
  const [formData, setFormData] = useState({})
  const [testingIntegration, setTestingIntegration] = useState(null)
  const queryClient = useQueryClient()
  const { logos, loading: logoLoading, searchMultipleLogos, getLogo } = useLogoSearch()

  // Load logos for all integration types on component mount
  useEffect(() => {
    const companyNames = INTEGRATION_TYPES
      .filter(type => type.companyName !== 'Custom')
      .map(type => type.companyName)
    
    if (companyNames.length > 0) {
      searchMultipleLogos(companyNames)
    }
  }, [searchMultipleLogos])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
              Integrations
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Seamlessly connect with your favorite tools and supercharge your monitoring workflow
            </p>
          </div>
        </div>
      </div>

      {/* Integration Types Grid */}
      {!selectedIntegration && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {INTEGRATION_TYPES.map((integration, index) => {
              const existingIntegrations = data?.integrations?.filter(i => i.type === integration.id) || []
              
              return (
                <div
                  key={integration.id}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer border border-white/20 hover:border-blue-200/50"
                  onClick={() => setSelectedIntegration(integration)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Status Badge */}
                  {existingIntegrations.length > 0 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                      {existingIntegrations.length} Active
                    </div>
                  )}
                  
                  {/* Icon Container */}
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${integration.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl relative overflow-hidden`}>
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {getLogo(integration.companyName) ? (
                        <img 
                          src={getLogo(integration.companyName)} 
                          alt={`${integration.name} logo`}
                          className="w-12 h-12 object-contain relative z-10"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'block'
                          }}
                        />
                      ) : null}
                      <span 
                        className="text-4xl relative z-10"
                        style={{ display: getLogo(integration.companyName) ? 'none' : 'block' }}
                      >
                        {integration.icon}
                      </span>
                      
                      {logoLoading && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-900 transition-colors duration-300">
                      {integration.name}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {integration.description}
                    </p>
                    
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {existingIntegrations.length > 0 ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircleIcon className="h-5 w-5" />
                            <span className="font-medium">Connected</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-400">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <span className="text-sm">Not connected</span>
                          </div>
                        )}
                      </div>
                      
                      <button className="group/btn relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-lg">
                        <span className="relative z-10 flex items-center space-x-2">
                          <PlusIcon className="h-4 w-4" />
                          <span>Connect</span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              )
            })}
          </div>
          
          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Need a custom integration?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Don't see your favorite tool? We can help you create custom webhooks and integrations for any service.
              </p>
              <button className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:from-gray-900 hover:to-black transition-all duration-300 hover:scale-105 hover:shadow-lg">
                Contact Support
              </button>
            </div>
          </div>
          
          {/* Security Notice */}
          <div className="mt-16">
            <div className="bg-amber-50/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-amber-800 mb-3">Security Notice</h4>
                  <ul className="space-y-2 text-sm text-amber-700">
                    <li className="flex items-start space-x-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>Keep your API keys secure and never share them publicly</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>Regenerate keys if you suspect they've been compromised</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>Use different keys for different applications or environments</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>Monitor your key usage regularly in the dashboard</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Integration Form */}
      {selectedIntegration && integrationConfig && (
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-white/20">
            <div className="flex items-center justify-between mb-8">
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

