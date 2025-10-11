import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { toast } from 'sonner'
import LoadingSpinner from '../components/LoadingSpinner'
import URLAutocomplete from '../components/URLAutocomplete'
import { useAuth } from '../contexts/AuthContext'
import { ExclamationTriangleIcon, EnvelopeIcon, ArrowRightIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function CreateMonitorPage() {
  const [loading, setLoading] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const { user, logout } = useAuth()
  const isEditMode = !!id
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm()

  // Fetch monitor data if editing
  const { data: monitorData, isLoading: isLoadingMonitor } = useQuery({
    queryKey: ['monitor', id],
    queryFn: () => api.get(`/monitors/${id}`).then(res => res.data),
    enabled: isEditMode,
    retry: 1
  })

  // Populate form with existing data
  useEffect(() => {
    if (monitorData?.monitor) {
      reset({
        name: monitorData.monitor.name,
        type: monitorData.monitor.type,
        url: monitorData.monitor.url || '',
        interval: monitorData.monitor.interval,
        port: monitorData.monitor.port || '',
      })
    }
  }, [monitorData, reset])

  // Normalize URL - add protocol if missing
  const normalizeUrl = (url) => {
    if (!url) return url
    
    // Trim whitespace
    url = url.trim()
    
    // If it's already a valid URL with protocol, return as is
    if (/^https?:\/\//i.test(url)) {
      return url
    }
    
    // If it starts with www., add https://
    if (url.startsWith('www.')) {
      return `https://${url}`
    }
    
    // For everything else (like bot9.ai), add https://
    return `https://${url}`
  }

  const onSubmit = async (data) => {
    // Check email verification for new monitors only
    if (!isEditMode && user && !user.isEmailVerified) {
      setShowVerificationModal(true)
      return
    }

    setLoading(true)
    try {
      // Normalize the URL
      const normalizedUrl = normalizeUrl(data.url)

      // Convert interval to number and clean up payload
      const payload = {
        name: data.name,
        type: data.type,
        url: normalizedUrl,
        interval: parseInt(data.interval)
      }

      // Only add port if it's provided
      if (data.port) {
        payload.port = parseInt(data.port)
      }
      
      if (isEditMode) {
        await api.put(`/monitors/${id}`, payload)
        toast.success('Monitor updated successfully!')
      } else {
        await api.post('/monitors', payload)
        toast.success('Monitor created successfully!')
      }
      navigate('/monitors')
    } catch (error) {
      console.error('Save monitor error:', error);
      toast.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} monitor`)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResendingEmail(true)
    try {
      await api.post('/auth/resend-verification')
      toast.success('Verification email sent! Please check your inbox.')
    } catch (error) {
      console.error('Resend verification error:', error)
      toast.error('Failed to send verification email. Please try again.')
    } finally {
      setResendingEmail(false)
    }
  }

  const handleLogoutAndRegister = async () => {
    await logout()
    navigate('/register')
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/monitors/${id}`)
      toast.success('Monitor deleted successfully!')
      navigate('/monitors')
    } catch (error) {
      console.error('Delete monitor error:', error)
      toast.error(error.response?.data?.error || 'Failed to delete monitor')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (isEditMode && isLoadingMonitor) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Monitor' : 'Create Monitor'}
        </h1>
        <p className="text-gray-600">
          {isEditMode ? 'Update your monitor configuration' : 'Set up a new monitor to track your service'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="input mt-1"
            placeholder="My Website"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Type</label>
          <select {...register('type')} className="select mt-1">
            <option value="http">HTTP/HTTPS</option>
            <option value="ping">Ping</option>
            <option value="port">Port</option>
            <option value="ssl">SSL Certificate</option>
            <option value="domain">Domain Expiry</option>
            <option value="heartbeat">Heartbeat</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">URL/IP</label>
          <Controller
            name="url"
            control={control}
            rules={{
              required: 'URL is required',
              validate: (value) => {
                if (!value) return 'URL is required'
                // Very lenient validation - just check if it's not empty
                const trimmed = value.trim()
                if (trimmed.length < 3) return 'Please enter a valid URL or domain'
                return true
              }
            }}
            render={({ field }) => (
              <URLAutocomplete
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.url?.message}
                placeholder="example.com or https://example.com"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Check Interval</label>
          <select {...register('interval')} className="select mt-1">
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={300}>5 minutes</option>
            <option value={600}>10 minutes</option>
            <option value={1800}>30 minutes</option>
            <option value={3600}>1 hour</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg px-8"
            >
              {loading ? <LoadingSpinner size="sm" /> : (isEditMode ? 'Update Monitor' : 'Create Monitor')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/monitors')}
              className="btn btn-secondary btn-lg px-8"
            >
              Cancel
            </button>
          </div>
          {isEditMode && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-danger btn-lg px-8"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete Monitor
            </button>
          )}
        </div>
      </form>

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
                    Delete Monitor
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this monitor? This action cannot be undone. All historical data, checks, and incidents associated with this monitor will be permanently deleted.
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
                  {deleting ? <LoadingSpinner size="sm" /> : 'Delete Monitor'}
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
