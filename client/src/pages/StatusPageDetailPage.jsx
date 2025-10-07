import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { api } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function StatusPageDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isCreateMode = id === 'create'
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      description: '',
      isPublic: true,
      primaryColor: '#3b82f6'
    }
  })
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['status-page', id],
    queryFn: () => api.get(`/status-pages/${id}`).then(res => res.data),
    enabled: !!id && !isCreateMode,
    retry: 1,
    onSuccess: (data) => {
      if (data?.statusPage) {
        reset(data.statusPage)
      }
    }
  })
  
  // If edit mode and data loaded, populate the form
  if (!isCreateMode && data?.statusPage && !isLoading) {
    // Only reset once when data is first loaded
    const formValues = {
      name: data.statusPage.name || '',
      description: data.statusPage.description || '',
      primaryColor: data.statusPage.primaryColor || '#3b82f6',
      logoUrl: data.statusPage.logoUrl || '',
      customDomain: data.statusPage.customDomain || '',
      isPublic: data.statusPage.isPublic !== undefined ? data.statusPage.isPublic : true
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
    onSuccess: () => {
      toast.success('Status page created successfully!')
      queryClient.invalidateQueries(['status-pages'])
      navigate('/status-pages')
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

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this status page?')) {
      deleteMutation.mutate()
    }
  }

  if (!isCreateMode && isLoading) {
    return <LoadingSpinner />
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
        {!isCreateMode && (
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isLoading}
            className="btn btn-danger btn-md"
          >
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
          </button>
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
    </div>
  )
}
