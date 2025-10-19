import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { toast } from 'sonner'
import { PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

// Integration logo component
function IntegrationLogo({ type, className = "w-full h-full" }) {
  const logos = {
    slack: (
      <img
        src="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png"
        alt="Slack"
        className={className}
      />
    ),
    discord: (
      <img
        src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png"
        alt="Discord"
        className={className}
      />
    ),
    webhook: (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }

  return logos[type] || null
}

const INTEGRATION_TYPES = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Real-time alerts in your channels',
    color: 'bg-white dark:bg-gray-700',
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...' },
      { name: 'channel', label: 'Channel', type: 'text', placeholder: '#alerts' }
    ]
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Monitor notifications for your team',
    color: 'bg-white dark:bg-gray-700',
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://discord.com/api/webhooks/...' }
    ]
  },
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Custom integrations',
    color: 'bg-gray-100 dark:bg-gray-700',
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://your-endpoint.com/webhook' },
      { name: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'GET', 'PUT'] }
    ]
  }
]

const INSTALLATION_GUIDES = {
  slack: {
    title: 'Setting up Slack Integration',
    steps: [
      {
        title: '1. Create a Slack Incoming Webhook',
        content: 'Go to your Slack workspace settings and navigate to Apps. Search for "Incoming Webhooks" and click "Add to Slack".'
      },
      {
        title: '2. Choose a Channel',
        content: 'Select the channel where you want to receive uptime notifications. You can change this later if needed.'
      },
      {
        title: '3. Copy the Webhook URL',
        content: 'Slack will generate a webhook URL that looks like: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX'
      },
      {
        title: '4. Paste in the Form',
        content: 'Copy this URL and paste it into the "Webhook URL" field above, along with your desired channel name (e.g., #alerts or #monitoring).'
      },
      {
        title: '5. Test the Integration',
        content: 'After saving, click the "Test" button to send a test notification to your Slack channel and verify everything is working correctly.'
      }
    ]
  },
  discord: {
    title: 'Setting up Discord Integration',
    steps: [
      {
        title: '1. Open Server Settings',
        content: 'Go to your Discord server, click on the server name, and select "Server Settings" from the dropdown menu.'
      },
      {
        title: '2. Create a Webhook',
        content: 'Navigate to the "Integrations" tab, then click on "Webhooks". Click the "New Webhook" button to create one.'
      },
      {
        title: '3. Configure the Webhook',
        content: 'Give your webhook a name (e.g., "Uptime Monitor"), select the channel where notifications should be posted, and optionally upload an avatar.'
      },
      {
        title: '4. Copy Webhook URL',
        content: 'Click "Copy Webhook URL". The URL will look like: https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz'
      },
      {
        title: '5. Add to Integration',
        content: 'Paste the webhook URL into the form above and save. Use the "Test" button to verify notifications are being delivered to your Discord channel.'
      }
    ]
  },
  webhook: {
    title: 'Setting up Custom Webhook Integration',
    steps: [
      {
        title: '1. Prepare Your Endpoint',
        content: 'Set up an HTTPS endpoint that can receive POST/GET/PUT requests. Your endpoint should be able to handle JSON payloads.'
      },
      {
        title: '2. Example Payload Structure',
        content: `Your endpoint will receive notifications in this format:
{
  "event": "monitor.down",
  "monitor": {
    "id": "123",
    "name": "My Website",
    "url": "https://example.com"
  },
  "timestamp": "2025-10-19T12:00:00Z",
  "message": "Monitor is down"
}`
      },
      {
        title: '3. Test with webhook.site',
        content: 'For testing, visit https://webhook.site to get a free temporary webhook URL. This is perfect for testing the integration before connecting your real endpoint.'
      },
      {
        title: '4. Configure in Form',
        content: 'Enter your webhook URL in the form above. Choose the HTTP method (POST is recommended). You can use webhook.site URL for initial testing.'
      },
      {
        title: '5. Test & Verify',
        content: 'Click "Test" to send a sample notification. If using webhook.site, you\'ll see the request appear in real-time on their dashboard, showing all headers and payload data.'
      },
      {
        title: '6. Security Best Practices',
        content: 'Always use HTTPS endpoints. Consider implementing webhook signature verification or API key authentication for production use.'
      }
    ]
  }
}

export default function IntegrationsPage() {
  const [selectedIntegrationType, setSelectedIntegrationType] = useState(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState(null)
  const [formData, setFormData] = useState({})
  const [testingIntegration, setTestingIntegration] = useState(null)
  const [expandedIntegration, setExpandedIntegration] = useState(null)
  const [showGuide, setShowGuide] = useState(null)
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
      setIsAddingNew(false)
      setFormData({})
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add integration')
    }
  })

  // Update integration mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/integrations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations'])
      toast.success('Integration updated successfully!')
      setEditingIntegration(null)
      setFormData({})
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update integration')
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
    if (!selectedIntegrationType) return

    if (editingIntegration) {
      // Update existing integration
      updateMutation.mutate({
        id: editingIntegration.id,
        data: {
          config: formData,
          enabled: true
        }
      })
    } else {
      // Create new integration
      const integration = {
        type: selectedIntegrationType.id,
        name: `${selectedIntegrationType.name} Integration`,
        config: formData,
        enabled: true
      }
      createMutation.mutate(integration)
    }
  }

  const handleEdit = (integration) => {
    setEditingIntegration(integration)
    setFormData(integration.config || {})
    setIsAddingNew(true)
  }

  const handleTest = (integrationId) => {
    setTestingIntegration(integrationId)
    testMutation.mutate(integrationId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Get instances for a specific integration type
  const getIntegrationInstances = (typeId) => {
    return data?.integrations?.filter(i => i.type === typeId) || []
  }

  // Handle opening integration type modal
  const handleOpenIntegration = (integrationType) => {
    setSelectedIntegrationType(integrationType)
    setIsAddingNew(false)
    setFormData({})
  }

  // Handle closing modal
  const handleCloseModal = () => {
    setSelectedIntegrationType(null)
    setIsAddingNew(false)
    setEditingIntegration(null)
    setFormData({})
  }

  // Get the configuration for the selected integration type
  const integrationConfig = selectedIntegrationType
    ? INTEGRATION_TYPES.find(t => t.id === selectedIntegrationType.id)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Integrations</h1>
        <p className="text-gray-600 dark:text-gray-400">Connect with your favorite tools</p>
      </div>

      {/* Integration Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTEGRATION_TYPES.map((integration) => {
          const existingIntegrations = getIntegrationInstances(integration.id)

          return (
            <div
              key={integration.id}
              className="card p-6 hover:shadow-lg transition-all group relative"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowGuide(integration.id)
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                title="Installation Guide"
              >
                <QuestionMarkCircleIcon className="h-5 w-5" />
              </button>

              <div
                className="cursor-pointer flex flex-col h-full"
                onClick={() => handleOpenIntegration(integration)}
              >
                <div className={`w-16 h-16 rounded-xl ${integration.color} border border-gray-200 dark:border-gray-600 flex items-center justify-center p-3 mb-4 group-hover:scale-110 transition-transform`}>
                  <IntegrationLogo type={integration.id} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{integration.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{integration.description}</p>

                <div className="h-8 mb-4">
                  {existingIntegrations.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">
                        {existingIntegrations.length} active
                      </span>
                    </div>
                  )}
                </div>

                <button className="mt-auto w-full btn btn-primary btn-sm">
                  {existingIntegrations.length > 0 ? 'Manage' : 'Add Integration'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Integration Management Modal */}
      {selectedIntegrationType && integrationConfig && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 transition-opacity" onClick={handleCloseModal} />

            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
              {/* Back to list button - only show when adding new */}
              {isAddingNew && (
                <div className="px-6 pt-4 pb-2">
                  <button
                    onClick={() => setIsAddingNew(false)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
                  >
                    ← Back to list
                  </button>
                </div>
              )}

              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${integrationConfig.color} border border-gray-200 dark:border-gray-600 flex items-center justify-center p-2`}>
                      <IntegrationLogo type={integrationConfig.id} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{integrationConfig.name}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{integrationConfig.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                {!isAddingNew ? (
                  <>
                    {/* Existing Instances */}
                    {getIntegrationInstances(integrationConfig.id).length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Active Instances ({getIntegrationInstances(integrationConfig.id).length})
                        </h3>
                        <div className="space-y-3">
                          {getIntegrationInstances(integrationConfig.id).map((instance) => {
                            const isExpanded = expandedIntegration === instance.id

                            return (
                              <div key={instance.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{instance.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      Created {new Date(instance.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setExpandedIntegration(isExpanded ? null : instance.id)}
                                      className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium border border-gray-300 dark:border-gray-600 rounded-md hover:bg-white dark:hover:bg-gray-800"
                                    >
                                      {isExpanded ? 'Hide' : 'View'}
                                    </button>
                                    <button
                                      onClick={() => handleEdit(instance)}
                                      className="px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleTest(instance.id)}
                                      disabled={testingIntegration === instance.id}
                                      className="px-3 py-1.5 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium border border-primary-200 dark:border-primary-800 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/30"
                                    >
                                      {testingIntegration === instance.id ? 'Testing...' : 'Test'}
                                    </button>
                                    <button
                                      onClick={() => deleteMutation.mutate(instance.id)}
                                      disabled={deleteMutation.isLoading}
                                      className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>

                                {/* Expanded Configuration */}
                                {isExpanded && (
                                  <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                    <div className="space-y-2">
                                      {Object.entries(instance.config || {}).map(([key, value]) => (
                                        <div key={key} className="flex items-start gap-3">
                                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[100px] capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                                          </span>
                                          <span className="text-xs text-gray-900 dark:text-gray-100 break-all flex-1">
                                            {String(value)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Add New Button */}
                    <button
                      onClick={() => setIsAddingNew(true)}
                      className="w-full btn btn-primary btn-md"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add New {integrationConfig.name} Integration
                    </button>
                  </>
                ) : (
                  <>
                    {/* Add New Form */}

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
                          disabled={editingIntegration ? updateMutation.isLoading : createMutation.isLoading}
                          className="btn btn-primary btn-md"
                        >
                          {editingIntegration
                            ? (updateMutation.isLoading ? 'Updating...' : 'Update Integration')
                            : (createMutation.isLoading ? 'Adding...' : 'Add Integration')
                          }
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNew(false)
                            setEditingIntegration(null)
                            setFormData({})
                          }}
                          className="btn btn-secondary btn-md"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Installation Guide Modal */}
      {showGuide && INSTALLATION_GUIDES[showGuide] && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" onClick={() => setShowGuide(null)} />

            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {INSTALLATION_GUIDES[showGuide].title}
                  </h2>
                  <button
                    onClick={() => setShowGuide(null)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-6">
                  {INSTALLATION_GUIDES[showGuide].steps.map((step, index) => (
                    <div key={index} className="pb-6 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {step.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowGuide(null)}
                  className="w-full btn btn-primary btn-md"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

