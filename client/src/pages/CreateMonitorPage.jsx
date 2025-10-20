import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { toast } from '@/lib/toast'
import { playErrorSound, playSuccessSound } from '../lib/sounds'
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
  const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch } = useForm({
    defaultValues: {
      type: 'http',
      interval: 60
    }
  })

  // Watch URL field to auto-generate name
  const urlValue = watch('url')

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

    // For everything else (like example.com), add https://
    return `https://${url}`
  }

  // Extract name from URL (domain before TLD)
  const extractNameFromUrl = (url) => {
    if (!url) return ''

    try {
      // Remove protocol if exists
      let domain = url.replace(/^https?:\/\//i, '').replace(/^www\./i, '')

      // Remove path and query params
      domain = domain.split('/')[0].split('?')[0]

      // Remove port if exists
      domain = domain.split(':')[0]

      // Extract the part before the TLD
      // For example: example.com -> example, my-site.co.uk -> my-site
      const parts = domain.split('.')

      // If we have at least 2 parts (domain.tld), return the first part
      if (parts.length >= 2) {
        return parts[0]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }

      return domain
    } catch (e) {
      return ''
    }
  }

  // Auto-generate name from URL (only for new monitors)
  useEffect(() => {
    if (!isEditMode && urlValue) {
      const generatedName = extractNameFromUrl(urlValue)
      if (generatedName) {
        setValue('name', generatedName)
      }
    }
  }, [urlValue, isEditMode, setValue])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + Enter to submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit(onSubmit)()
      }
      // Escape to cancel
      if (e.key === 'Escape') {
        e.preventDefault()
        navigate('/monitors')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSubmit, navigate])

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
        playSuccessSound(); toast.success('Monitor updated successfully!')
      } else {
        await api.post('/monitors', payload)
        playSuccessSound(); toast.success('Monitor created successfully!')
      }
      navigate('/monitors')
    } catch (error) {
      console.error('Save monitor error:', error);
      playErrorSound(); toast.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} monitor`)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResendingEmail(true)
    try {
      await api.post('/auth/resend-verification')
      playSuccessSound(); toast.success('Verification email sent! Please check your inbox and spam folder.')
    } catch (error) {
      console.error('Resend verification error:', error)
      playErrorSound(); toast.error('Failed to send verification email. Please try again.')
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
      playSuccessSound(); toast.success('Monitor deleted successfully!')
      navigate('/monitors')
    } catch (error) {
      console.error('Delete monitor error:', error)
      playErrorSound(); toast.error(error.response?.data?.error || 'Failed to delete monitor')
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isEditMode ? 'Edit Monitor' : 'Create Monitor'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isEditMode ? 'Update your monitor configuration' : 'Set up a new monitor to track your service'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">URL/IP</label>
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
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Name
            {!isEditMode && <span className="text-xs text-gray-500 font-normal ml-2">(Auto-generated from URL)</span>}
          </label>
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
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { value: 'http', label: 'HTTP/HTTPS', icon: '🌐' },
              { value: 'ping', label: 'Ping', icon: '📡' },
              { value: 'port', label: 'Port', icon: '🔌' },
              { value: 'ssl', label: 'SSL Cert', icon: '🔒' },
              { value: 'domain', label: 'Domain', icon: '🌍' },
              { value: 'heartbeat', label: 'Heartbeat', icon: '💓' }
            ].map((type) => (
              <label
                key={type.value}
                className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  watch('type') === type.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  {...register('type')}
                  type="radio"
                  value={type.value}
                  className="sr-only"
                />
                <span className="text-2xl mb-2">{type.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{type.label}</span>
                {watch('type') === type.value && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Check Interval</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { value: 30, label: '30 sec' },
              { value: 60, label: '1 min' },
              { value: 300, label: '5 min' },
              { value: 600, label: '10 min' },
              { value: 1800, label: '30 min' },
              { value: 3600, label: '1 hour' }
            ].map((interval) => (
              <label
                key={interval.value}
                className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  Number(watch('interval')) === interval.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  {...register('interval')}
                  type="radio"
                  value={interval.value}
                  className="sr-only"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{interval.label}</span>
                {Number(watch('interval')) === interval.value && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg px-8 flex items-center gap-3"
            >
              {loading ? <LoadingSpinner size="sm" /> : (
                <>
                  <span>{isEditMode ? 'Update Monitor' : 'Create Monitor'}</span>
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <kbd className="px-2 py-1 text-xs font-semibold text-white bg-primary-700 border border-primary-600 rounded">⌘</kbd>
                    <kbd className="px-2 py-1 text-xs font-semibold text-white bg-primary-700 border border-primary-600 rounded">↵</kbd>
                  </span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/monitors')}
              className="btn btn-secondary btn-lg px-8 flex items-center gap-3"
            >
              <span>Cancel</span>
              <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Esc</kbd>
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

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowVerificationModal(false)} />

            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                    Email Verification Required
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Please verify your email address (<strong>{user?.email}</strong>) before creating monitors. We've sent a verification link to your email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="btn btn-primary btn-md w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {resendingEmail ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <EnvelopeIcon className="h-5 w-5" />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(false)}
                  disabled={resendingEmail}
                  className="btn btn-secondary btn-md w-full sm:w-auto"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Wrong email address?{' '}
                  <button
                    onClick={handleLogoutAndRegister}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Register with a different email
                  </button>
                </p>
              </div>
            </div>
          </div>
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
                    Delete Monitor
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
