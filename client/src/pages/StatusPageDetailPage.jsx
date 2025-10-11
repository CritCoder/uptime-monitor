import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { api } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { PlusIcon, TrashIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function StatusPageDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isCreateMode = !id || id === 'create'
  const [showMonitorSelect, setShowMonitorSelect] = useState(false)
  const [selectedMonitor, setSelectedMonitor] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  console.log('StatusPageDetailPage - id:', id, 'isCreateMode:', isCreateMode)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      description: '',
      isPublic: true,
      primaryColor: '#3b82f6',
      logoUrl: '',
      customDomain: ''
    }
  })
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['status-page', id],
    queryFn: () => api.get(`/status-pages/${id}`).then(res => res.data),
    enabled: !!id && !isCreateMode,
    retry: 1
  })
  
  // Reset form when data is loaded
  useEffect(() => {
    if (!isCreateMode && data?.statusPage) {
      reset({
        name: data.statusPage.name || '',
        description: data.statusPage.description || '',
        primaryColor: data.statusPage.primaryColor || '#3b82f6',
        logoUrl: data.statusPage.logoUrl || '',
        customDomain: data.statusPage.customDomain || '',
        isPublic: data.statusPage.isPublic !== undefined ? data.statusPage.isPublic : true
      })
    }
  }, [data, isCreateMode, reset])

  // Fetch all monitors for the workspace
  const { data: monitorsData } = useQuery({
    queryKey: ['monitors'],
    queryFn: () => api.get('/monitors').then(res => res.data),
    enabled: !isCreateMode
  })

  const addMonitorMutation = useMutation({
    mutationFn: ({ statusPageId, monitorId }) => 
      api.post(`/status-pages/${statusPageId}/monitors`, { monitorId }),
    onSuccess: () => {
      toast.success('Monitor added to status page!')
      queryClient.invalidateQueries(['status-page', id])
      setShowMonitorSelect(false)
      setSelectedMonitor('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add monitor')
    }
  })

  const removeMonitorMutation = useMutation({
    mutationFn: ({ statusPageId, monitorId }) => 
      api.delete(`/status-pages/${statusPageId}/monitors/${monitorId}`),
    onSuccess: () => {
      toast.success('Monitor removed from status page!')
      queryClient.invalidateQueries(['status-page', id])
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to remove monitor')
    }
  })

  const handleAddMonitor = () => {
    if (!selectedMonitor) {
      toast.error('Please select a monitor')
      return
    }
    if (!id || id === 'create') {
      toast.error('Invalid status page ID')
      return
    }
    addMonitorMutation.mutate({ statusPageId: id, monitorId: selectedMonitor })
  }

  const handleRemoveMonitor = (monitorId) => {
    if (window.confirm('Remove this monitor from the status page?')) {
      removeMonitorMutation.mutate({ statusPageId: id, monitorId })
    }
  }

  const createMutation = useMutation({
    mutationFn: (data) => {
      const workspaceId = user?.workspaces?.[0]?.id
      if (!workspaceId) {
        throw new Error('No workspace found')
      }
      return api.post('/status-pages', { ...data, workspaceId })
    },
    onSuccess: (response) => {
      console.log('Create response:', response)
      const newStatusPageId = response.data?.statusPage?.id
      console.log('New status page ID:', newStatusPageId)
      if (newStatusPageId) {
        // Pre-populate the cache with the new status page data
        queryClient.setQueryData(['status-page', newStatusPageId], response.data)
        toast.success('Status page created successfully!')
        queryClient.invalidateQueries(['status-pages'])
        // Navigate to the newly created status page's edit page
        console.log('Navigating to:', `/status-pages/${newStatusPageId}`)
        navigate(`/status-pages/${newStatusPageId}`)
      } else {
        console.error('No status page ID in response!')
        toast.success('Status page created successfully!')
        queryClient.invalidateQueries(['status-pages'])
        navigate('/status-pages')
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create status page')
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/status-pages/${id}`, data),
    onSuccess: () => {
      toast.success('Status page updated successfully!')
      queryClient.invalidateQueries(['status-pages'])
      queryClient.invalidateQueries(['status-page', id])
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update status page')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/status-pages/${id}`),
    onSuccess: () => {
      toast.success('Status page deleted successfully!')
      queryClient.invalidateQueries(['status-pages'])
      navigate('/status-pages')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete status page')
    }
  })

  const onSubmit = (data) => {
    if (isCreateMode) {
      createMutation.mutate(data)
    } else {
      updateMutation.mutate(data)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/status-pages/${id}`)
      toast.success('Status page deleted successfully!')
      queryClient.invalidateQueries(['status-pages'])
      navigate('/status-pages')
    } catch (error) {
      console.error('Delete status page error:', error)
      toast.error(error.response?.data?.error || 'Failed to delete status page')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (!isCreateMode && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  if (!isCreateMode && error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Status page not found</h2>
          <p className="text-gray-600 mb-4">The status page you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/status-pages')}
            className="btn btn-primary btn-md"
          >
            Back to Status Pages
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isCreateMode ? 'Create Status Page' : 'Edit Status Page'}
        </h1>
        {!isCreateMode && data?.statusPage && (
          <div className="flex gap-3">
            <a
              href={`/status/${data.statusPage.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-md"
            >
              View
            </a>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-danger btn-md"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
        <div>
          <label className="label">Status Page Name</label>
          <input
            {...register('name', { required: 'Name is required', maxLength: 100 })}
            type="text"
            className="input"
            placeholder="My Status Page"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            {...register('description', { maxLength: 500 })}
            className="textarea"
            rows="3"
            placeholder="System status updates and monitoring"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        <div>
          <label className="label">Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              {...register('primaryColor')}
              type="color"
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
            />
            <input
              {...register('primaryColor', {
                pattern: {
                  value: /^#[0-9A-Fa-f]{6}$/,
                  message: 'Invalid color format'
                }
              })}
              type="text"
              className="input flex-1"
              placeholder="#3b82f6"
            />
          </div>
          {errors.primaryColor && <p className="mt-1 text-sm text-red-600">{errors.primaryColor.message}</p>}
        </div>

        <div>
          <label className="label">Logo URL (Optional)</label>
          <input
            {...register('logoUrl', {
              validate: value => !value || /^https?:\/\/.+/.test(value) || 'Must be a valid URL'
            })}
            type="url"
            className="input"
            placeholder="https://example.com/logo.png"
          />
          {errors.logoUrl && <p className="mt-1 text-sm text-red-600">{errors.logoUrl.message}</p>}
        </div>

        <div>
          <label className="label">Custom Domain (Optional)</label>
          <input
            {...register('customDomain')}
            type="text"
            className="input"
            placeholder="status.example.com"
          />
        </div>

        <div className="flex items-center">
          <input
            {...register('isPublic')}
            type="checkbox"
            id="isPublic"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
            Make this status page public
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMutation.isLoading || updateMutation.isLoading}
            className="btn btn-primary btn-md"
          >
            {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : isCreateMode ? 'Create Status Page' : 'Update Status Page'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/status-pages')}
            className="btn btn-secondary btn-md"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Monitors Section - Only show in edit mode with valid data */}
      {!isCreateMode && data?.statusPage && (
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Monitors</h2>
              <p className="text-sm text-gray-600 mt-1">
                Add monitors to display on this status page
              </p>
            </div>
            <button
              onClick={() => setShowMonitorSelect(!showMonitorSelect)}
              className="btn btn-primary btn-md"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Monitor
            </button>
          </div>

          {/* Add Monitor Form */}
          {showMonitorSelect && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex gap-3">
                <select
                  value={selectedMonitor}
                  onChange={(e) => setSelectedMonitor(e.target.value)}
                  className="select flex-1"
                >
                  <option value="">Select a monitor...</option>
                  {monitorsData?.monitors
                    ?.filter(m => !data?.statusPage?.monitors?.some(sm => sm.monitorId === m.id))
                    ?.map(monitor => (
                      <option key={monitor.id} value={monitor.id}>
                        {monitor.name} ({monitor.type})
                      </option>
                    ))}
                </select>
                <button
                  onClick={handleAddMonitor}
                  disabled={addMonitorMutation.isPending || !selectedMonitor}
                  className="btn btn-primary btn-md"
                >
                  {addMonitorMutation.isPending ? 'Adding...' : 'Add'}
                </button>
                <button
                  onClick={() => {
                    setShowMonitorSelect(false)
                    setSelectedMonitor('')
                  }}
                  className="btn btn-secondary btn-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Current Monitors List */}
          {data?.statusPage?.monitors && data.statusPage.monitors.length > 0 ? (
            <div className="space-y-3">
              {data.statusPage.monitors.map((statusPageMonitor) => (
                <div
                  key={statusPageMonitor.monitorId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      statusPageMonitor.monitor?.status === 'up' ? 'bg-green-500' :
                      statusPageMonitor.monitor?.status === 'down' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {statusPageMonitor.monitor?.name}
                      </h4>
                      <p className="text-xs text-gray-500 capitalize">
                        {statusPageMonitor.monitor?.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMonitor(statusPageMonitor.monitorId)}
                    disabled={removeMonitorMutation.isPending}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No monitors added yet</p>
              <p className="text-sm">Add monitors to display them on your public status page</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)} />

            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Delete Status Page
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this status page? This action cannot be undone. All associated monitors and settings will be removed from this status page.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn btn-danger btn-md w-full sm:w-auto"
                >
                  {deleting ? <LoadingSpinner size="sm" /> : 'Delete Status Page'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="btn btn-secondary btn-md w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}